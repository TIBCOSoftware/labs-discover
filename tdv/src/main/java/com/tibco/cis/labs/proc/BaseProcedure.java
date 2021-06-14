package com.tibco.cis.labs.proc;

import com.compositesw.extension.CustomProcedure;
import com.compositesw.extension.CustomProcedureException;
import com.compositesw.extension.ExecutionEnvironment;
import com.compositesw.extension.ParameterInfo;
import com.compositesw.extension.ds.Logger;
import com.compositesw.extension.ds.impl.LoggerImpl;
import okhttp3.*;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public abstract class BaseProcedure implements CustomProcedure {

    private final String TOKEN_VALIDATE_URL = "https://discover.labs.tibcocloud.com/login/validate";
    public static final MediaType JSON = MediaType.get("application/json; charset=utf-8");


    private Logger logger;
    private ResultSet resultSet;
    private ExecutionEnvironment qenv;

    protected abstract String getTableName();

    protected abstract String getSelectClause();

    protected abstract ParameterInfo[] getOutCursorSchema();

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
        return "This procedure returns the content of the " + this.getTableName() + " table.";
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
    public ParameterInfo[] getParameterInfo() {
        List<ParameterInfo> parameterInfos = new ArrayList<>();
        parameterInfos.add(new ParameterInfo("path", Types.VARCHAR, DIRECTION_IN));
        parameterInfos.add(new ParameterInfo("token", Types.VARCHAR, DIRECTION_IN));

        // Add additional parameters
        parameterInfos.addAll(Arrays.asList(getAdditionalInputs()));

        // Add output cursor
        parameterInfos.add(new ParameterInfo("result", TYPED_CURSOR, DIRECTION_OUT, this.getOutCursorSchema()));

        return (parameterInfos.toArray(new ParameterInfo[0]));
    }

    protected ParameterInfo[] getAdditionalInputs() {
        return new ParameterInfo[]{new ParameterInfo("analysisId", Types.VARCHAR, DIRECTION_IN)};
    }

    protected String getWhereClause(Object[] additionalInputs){
        String analysisId = (String) additionalInputs[0];
        return( "WHERE analysis_id = '" + analysisId + "'");
    }

    private String getSqlQuery(String path, Object[] additionalInputs) {

        // TODO : verify getSelectClause and getWhereClause?

        return (getSelectClause() +
                "FROM " +
                path +
                " " +
                getWhereClause(additionalInputs));
    }

    @Override
    public void invoke(Object[] inputValues) throws CustomProcedureException, SQLException {
        String path = (String) inputValues[0];
        String token = (String) inputValues[1];

        String orgId = getOrgIdFromPath(path);

        // Escaping parts of the path that contain special characters
        path = escapePathParts(path);

        // TODO : verify token, org membership and discover group membership
        boolean isValid = isTokenValid(token, orgId);
        if (!isValid) {
            throw new CustomProcedureException("Could not get data. Either the token is invalid, or the user doesn't have the required permissions.");
        }

        Object[] additionalInputs = inputValues.length > 2 ? Arrays.copyOfRange(inputValues, 2, inputValues.length) : new Object[]{};

        String query = getSqlQuery(path, additionalInputs);

        logger.info("Executing query : " + query);
        this.resultSet = qenv.executeQuery(query, null);
    }

    private boolean isTokenValid(String token, String orgId) throws CustomProcedureException {

        boolean isValid = false;

        OkHttpClient client = new OkHttpClient.Builder().build();
        RequestBody body = RequestBody.create(JSON, "{\"credentials\": \"" + token + "\"}");

        Request request = new Request.Builder()
                .url(TOKEN_VALIDATE_URL)
                .post(body)
                .build();

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

    @Override
    public int getNumAffectedRows() throws CustomProcedureException, SQLException {
        return 0;
    }

    @Override
    public Object[] getOutputValues() throws CustomProcedureException, SQLException {
        return new Object[]{resultSet};
    }

    @Override
    public void close() throws CustomProcedureException, SQLException {
        if (resultSet != null) {
            resultSet.close();
        }
    }
}