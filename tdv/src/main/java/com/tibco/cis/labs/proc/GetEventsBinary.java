package com.tibco.cis.labs.proc;

import com.compositesw.extension.ParameterInfo;

import java.sql.Types;

public class GetEventsBinary extends BaseProcedure {
    @Override
    protected String getTableName() {
        return "events_binary";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT analysis_id, " +
                "content, " +
                "content_type ";
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("analysis_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("content", Types.BLOB, DIRECTION_NONE),
                new ParameterInfo("content_type", Types.VARCHAR, DIRECTION_NONE)
        };
    }
}
