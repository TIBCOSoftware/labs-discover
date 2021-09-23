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

public class GetAnalysis extends BaseProcedure {

    @Override
    protected String getTableName() {
        return "events_binary";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT DISTINCT analysis_id ";
    }

    @Override
    protected String getWhereClause(Object[] additionalInputs) {
        return "";
    }

    @Override
    protected ParameterInfo[] getAdditionalInputs() {
        return new ParameterInfo[]{};
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("analysis_id", Types.VARCHAR, DIRECTION_NONE)
        };
    }
}
