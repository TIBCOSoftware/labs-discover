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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GetVariantsStatus extends BaseProcedure {
    @Override
    protected String getTableName() {
        return "variants_status";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT analysis_id, " +
                "variant_id, " +
                "label, " +
                "case_type, " +
                "case_state, " +
                "\"timestamp\", " +
                "LACaseRef, " +
                "isReference ";
    }

    @Override
    protected ParameterInfo[] getAdditionalInputs() {
        return new ParameterInfo[]{
                new ParameterInfo("analysisId", Types.VARCHAR, DIRECTION_IN),
                new ParameterInfo("refreshToken", Types.VARCHAR, DIRECTION_IN)
        };
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("analysis_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("variant_id", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("label", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("case_type", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("case_state", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("timestamp", Types.TIMESTAMP, DIRECTION_NONE),
                new ParameterInfo("LACaseRef", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("isReference", Types.INTEGER, DIRECTION_NONE)
        };
    }

}
