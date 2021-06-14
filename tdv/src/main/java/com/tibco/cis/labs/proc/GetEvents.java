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

public class GetEvents extends BaseProcedure {
    @Override
    protected String getTableName() {
        return "events";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT case_id, " +
                "activity_id, " +
                "activity_start_timestamp, " +
                "activity_end_timestamp, " +
                "resource_id, " +
                "resource_group, " +
                "requester, " +
                "scheduled_start, " +
                "scheduled_end, " +
                "duration_days, " +
                "duration_sec, " +
                "next_activity_id, " +
                "next_resource_id, " +
                "next_resource_group, " +
                "repeat_self_loop_flag, " +
                "redo_self_loop_flag, " +
                "start_flag, end_flag, " +
                "analysis_id, " +
                "row_id " ;
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("case_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("activity_id", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("activity_start_timestamp", Types.TIMESTAMP, DIRECTION_NONE),
                new ParameterInfo("activity_end_timestamp", Types.TIMESTAMP, DIRECTION_NONE),
                new ParameterInfo("resource_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("resource_group", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("requester", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("scheduled_start", Types.TIMESTAMP, DIRECTION_NONE),
                new ParameterInfo("scheduled_end", Types.TIMESTAMP, DIRECTION_NONE),
                new ParameterInfo("duration_days", Types.INTEGER, DIRECTION_NONE),
                new ParameterInfo("duration_sec", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("next_activity_id", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("next_resource_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("next_resource_group", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("repeat_self_loop_flag", Types.INTEGER, DIRECTION_NONE),
                new ParameterInfo("redo_self_loop_flag", Types.INTEGER, DIRECTION_NONE),
                new ParameterInfo("start_flag", Types.INTEGER, DIRECTION_NONE),
                new ParameterInfo("end_flag", Types.INTEGER, DIRECTION_NONE),
                new ParameterInfo("analysis_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("row_id", Types.BIGINT, DIRECTION_NONE)
        };
    }

}
