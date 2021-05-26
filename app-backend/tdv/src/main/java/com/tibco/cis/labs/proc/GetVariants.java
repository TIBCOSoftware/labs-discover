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

public class GetVariants extends BaseProcedure {


    @Override
    protected String getTableName() {
        return "variants";
    }

    @Override
    protected String getSelectClause() {
        return "SELECT variant, " +
                "variant_id, " +
                "frequency, " +
                "occurences_percent, " +
                "analysis_id, " +
                "bucketedFrequency, " +
                "bucketedFrequency_label ";
    }

    @Override
    protected ParameterInfo[] getOutCursorSchema() {
        return new ParameterInfo[]{
                new ParameterInfo("variant", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("variant_id", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("frequency", Types.BIGINT, DIRECTION_NONE),
                new ParameterInfo("occurences_percent", Types.DOUBLE, DIRECTION_NONE),
                new ParameterInfo("analysis_id", Types.VARCHAR, DIRECTION_NONE),
                new ParameterInfo("bucketedFrequency", Types.DOUBLE, DIRECTION_NONE),
                new ParameterInfo("bucketedFrequency_label", Types.VARCHAR, DIRECTION_NONE)
        };
    }

}
