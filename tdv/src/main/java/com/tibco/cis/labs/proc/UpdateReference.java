package com.tibco.cis.labs.proc;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Types;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.compositesw.extension.CustomProcedure;
import com.compositesw.extension.CustomProcedureException;
import com.compositesw.extension.ExecutionEnvironment;
import com.compositesw.extension.ParameterInfo;
import com.compositesw.extension.ds.Logger;
import com.compositesw.extension.ds.impl.LoggerImpl;

import okhttp3.Call;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class UpdateReference implements CustomProcedure {

    private final String TOKEN_VALIDATE_URL = "https://discover.labs.tibcocloud.com/login/validate";
    public static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private Logger logger;
    private ExecutionEnvironment qenv;

    private int numRowsUpdated = -1;
    private String lastUpdated = "";

    @Override
    public void initialize(ExecutionEnvironment executionEnvironment) throws CustomProcedureException, SQLException {
        this.logger = LoggerImpl.getLogger(this.getClass().getName());
        this.qenv = executionEnvironment;
    }

    @Override
    public String getName() {
        return this.getClass().getName();
    }

    @Override
    public String getDescription() {
        return "This procedure adds or removes variants to / from the reference model.";
    }

    @Override
    public boolean canCommit() {
        return false;
    }

    @Override
    public void commit() throws CustomProcedureException, SQLException {
    }

    @Override
    public void rollback() throws CustomProcedureException, SQLException {
    }

    @Override
    public boolean canCompensate() {
        return false;
    }

    @Override
    public void compensate(ExecutionEnvironment executionEnvironment) throws CustomProcedureException, SQLException {
    }

    @Override
    public final ParameterInfo[] getParameterInfo() {
        List<ParameterInfo> parameterInfos = new ArrayList<>();
        parameterInfos.add(new ParameterInfo("path", Types.VARCHAR, DIRECTION_IN));
        parameterInfos.add(new ParameterInfo("token", Types.VARCHAR, DIRECTION_IN));

        // Add additional parameters
        parameterInfos.addAll(Arrays.asList(getAdditionalInputs()));

        return (parameterInfos.toArray(new ParameterInfo[0]));
    }

    protected ParameterInfo[] getAdditionalInputs() {
        return new ParameterInfo[] { new ParameterInfo("analysisId", Types.VARCHAR, DIRECTION_IN),
                new ParameterInfo("variantIds", Types.VARCHAR, DIRECTION_IN),
                new ParameterInfo("numRowsUpdated", Types.INTEGER, DIRECTION_OUT),
                new ParameterInfo("lastUpdated", Types.VARCHAR, DIRECTION_OUT) };
    }

    private String getSqlQuery(String path, Object[] additionalInputs) {
        // TODO : check additionalInputs
        String query = "";
        String variantIds = (String) additionalInputs[1];

        if (variantIds.length() > 2) {
            char operation = variantIds.charAt(0);
            int isReference = 0;
            switch (operation) {
                case '0':
                    // Remove operation
                    break;
                case '1':
                    // Add operation
                    isReference = 1;
                    break;
                default:
                    logger.error("Unsupported operation : " + isReference + ". Input : " + variantIds);
                    return ("");
            }

            variantIds = variantIds.substring(2);

            query = "UPDATE " + path + " SET isReference = " + isReference + " WHERE \"analysis_id\" = '"
                    + additionalInputs[0] + "' AND variant_id IN (" + variantIds + ");";
        } else {
            logger.error("Incorrect value for list of variant ids : " + variantIds);
        }

        return (query);
    }

    @Override
    public final void invoke(Object[] inputValues) throws CustomProcedureException, SQLException {
        String path = (String) inputValues[0];
        String token = (String) inputValues[1];

        String orgId = getOrgIdFromPath(path);

        // Escaping parts of the path that contain special characters
        path = escapePathParts(path);

        // verify token, org membership and discover group membership
        boolean isValid = isTokenValid(token, orgId);
        if (!isValid) {
            throw new SQLException(
                    "Could not get data. Either the token is invalid, or the user doesn't have the required permissions.");
        }

        Object[] additionalInputs = inputValues.length > 2 ? Arrays.copyOfRange(inputValues, 2, inputValues.length)
                : new Object[] {};

        String query = getSqlQuery(path, additionalInputs);
        if (query.length() == 0) {
            logger.error("Ignoring empty query.");
            return;
        }

        logger.info("Executing update query : " + query);
        numRowsUpdated = qenv.executeUpdate(query, null);

        Date date = Calendar.getInstance().getTime();
        DateFormat dateFormat = new SimpleDateFormat("yyyy-mm-dd hh:mm:ss");
        lastUpdated = dateFormat.format(date);

    }

    private boolean isTokenValid(String token, String orgId) throws CustomProcedureException {

        boolean isValid = false;

        OkHttpClient client = new OkHttpClient.Builder().build();
        RequestBody body = RequestBody.create(JSON, "{\"credentials\": \"" + token + "\"}");

        Request request = new Request.Builder().url(TOKEN_VALIDATE_URL).post(body).build();

        logger.info("Calling token validation url.");

        Call call = client.newCall(request);
        try {
            Response response = call.execute();

            switch (response.code()) {
                case 200:
//            {
//                "code": 0,
//                    "orgId": "01DXJP1RPA35BZCV1KVEM9FFYK",
//                    "status": "Valid Credentials"
//            }
                    String responseBodyString = response.body().string();
                    logger.info(responseBodyString);
                    // Compare Org Ids
                    String orgIdFromResp = getOrgIdFromResponse(responseBodyString);
                    if (!orgId.equalsIgnoreCase(orgIdFromResp)) {
                        throw new CustomProcedureException("Token doesn't correspond to current OrgId");
                    }
                    isValid = true;
                    break;
                case 401:
//                {
//                    "code": 401,
//                        "orgId": "",
//                        "status": "Invalid Bearer"
//                }
                    logger.error("Invalid Token");
                    break;
                default:
                    logger.error("User doesn't have required permissions.");
            }

            response.body().close();
            response.close();
        } catch (IOException | CustomProcedureException e) {
            // TODO : rethrow
            throw new CustomProcedureException(e);
        }

        return isValid;
    }

    private final Pattern orgIdPathPattern = Pattern.compile("org_([^\\/]*)", Pattern.CASE_INSENSITIVE);

    private String getOrgIdFromPath(String path) throws CustomProcedureException {
        logger.info("GetOrgIdFromPath : " + path);
        Matcher m = orgIdPathPattern.matcher(path);
        if (!m.find()) {
            throw new CustomProcedureException("Could not get ORG Id from path");
        }
        return (m.group(1));
    }

    private final Pattern orgIdRespPattern = Pattern.compile("\"orgId\"\\s*:\\s*\"([^\"]*)", Pattern.CASE_INSENSITIVE);

    private String getOrgIdFromResponse(String response) throws CustomProcedureException {
        logger.info("GetOrgIdFromResponse : " + response);
        Matcher m = orgIdRespPattern.matcher(response);
        if (!m.find()) {
            throw new CustomProcedureException("Could not get ORG Id from response");
        }
        return (m.group(1));
    }

    private String escapePathParts(String path) {
        Pattern pattern = Pattern.compile("[^A-Za-zÀ-ÖØ-öø-ÿ\\d_]");
        String[] parts = path.split("/");
        for (int i = 0, len = parts.length; i < len; i++) {
            Matcher m = pattern.matcher(parts[i]);
            if (m.find()) {
                parts[i] = "\"" + parts[i] + "\"";
            }
        }

        return (String.join("/", parts));
    }

    public int getNumAffectedRows() {
        return numRowsUpdated;
    }

    public Object[] getOutputValues() {
        return new Object[] { Integer.valueOf(numRowsUpdated), lastUpdated };
    }

    @Override
    public void close() throws CustomProcedureException, SQLException {
    }
}
