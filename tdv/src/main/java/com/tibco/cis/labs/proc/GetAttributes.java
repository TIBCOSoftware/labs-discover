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

public class GetAttributes extends BaseProcedure{

    @Override
    protected String getTableName() {
        return "attributes";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT analysis_id, " +
                "row_id, " +
                "\"key\", " +
                "\"value\" ";
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("analysis_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("row_id", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("key", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("value", Types.VARCHAR, DIRECTION_NONE)
        };
    }
}
