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

public class GetCases extends BaseProcedure {


    @Override
    protected String getTableName() {
        return "cases";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT variant_id, " +
                "case_id, " +
                "case_start_timestamp, " +
                "case_end_timestamp, " +
                "total_case_duration, " +
                "activities_per_case, " +
                "analysis_id, " +
                "bucketedDuration, " +
                "bucketedDuration_label ";
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("variant_id", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("case_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("case_start_timestamp", Types.TIMESTAMP, DIRECTION_NONE),
                new ParameterInfo("case_end_timestamp", Types.TIMESTAMP, DIRECTION_NONE),
                new ParameterInfo("total_case_duration", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("activities_per_case", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("analysis_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("bucketedDuration", Types.DOUBLE, DIRECTION_NONE),
                new ParameterInfo("bucketedDuration_label", Types.VARCHAR, DIRECTION_NONE)
        };
    }
}
