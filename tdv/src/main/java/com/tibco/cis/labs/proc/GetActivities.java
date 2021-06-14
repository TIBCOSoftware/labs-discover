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

public class GetActivities extends BaseProcedure {


    @Override
    protected String getTableName() {
        return "activities";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT analysis_id, " +
                "activity_name, " +
                "id, " +
                "total_occurrences, " +
                "total_first, " +
                "total_last, " +
                "isEnd, " +
                "isStart ";
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("analysis_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("activity_name", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("id", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("total_occurrences", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("total_first", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("total_last", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("isEnd", Types.INTEGER, DIRECTION_NONE),
                new ParameterInfo("isStart", Types.INTEGER, DIRECTION_NONE)
        };
    }
}
