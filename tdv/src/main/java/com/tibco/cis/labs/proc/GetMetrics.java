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

public class GetMetrics extends BaseProcedure {
    @Override
    protected String getTableName() {
        return "metrics";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT num_of_events, " +
                "num_of_cases, " +
                "num_of_activities, " +
                "avgtime, " +
                "mediantime, " +
                "num_of_variants, " +
                "max_activities, " +
                "min_activities, " +
                "analysis_id ";
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("num_of_events", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("num_of_cases", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("num_of_activities", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("avgtime", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("mediantime", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("num_of_variants", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("max_activities", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("min_activities", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("analysis_id", Types.VARCHAR, DIRECTION_NONE),
        };
    }
}
