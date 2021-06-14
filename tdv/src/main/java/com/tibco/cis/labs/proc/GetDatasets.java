package com.tibco.cis.labs.proc;

import com.compositesw.extension.ParameterInfo;

import java.sql.Types;

public class GetDatasets extends BaseProcedure {
    @Override
    protected String getTableName() {
        return "datasets";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT dataset_id, " +
                "content, " +
                "content_type ";
    }

    @Override
    protected String getWhereClause(Object[] additionalInputs){
        String datasetId = (String) additionalInputs[0];
        return( "WHERE dataset_id = '" + datasetId + "'");
    }

    @Override
    protected ParameterInfo[] getAdditionalInputs() {
        return new ParameterInfo[]{
                new ParameterInfo("dataset_id", Types.VARCHAR, DIRECTION_IN)
        };
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("dataset_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("content", Types.BLOB, DIRECTION_NONE),
                new ParameterInfo("content_type", Types.VARCHAR, DIRECTION_NONE)
        };
    }
}
