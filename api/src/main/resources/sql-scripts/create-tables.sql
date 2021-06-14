--
-- Copyright © 2020. TIBCO Software Inc.
-- This file is subject to the license terms contained
-- in the license file that is distributed with this file.
--

-- Create new schema
CREATE SCHEMA "newSchema"
    AUTHORIZATION postgres;

-- Switch to newSchema
SET search_path TO "newSchema";

CREATE TABLE IF NOT EXISTS variants_status
(
    analysis_id character varying COLLATE pg_catalog."default" NOT NULL,
    variant_id bigint NOT NULL,
    label character varying COLLATE pg_catalog."default",
    case_type character varying COLLATE pg_catalog."default",
    case_state character varying COLLATE pg_catalog."default",
    "timestamp" timestamp without time zone,
    "LACaseRef" character varying COLLATE pg_catalog."default",
    "isReference" integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_variants_status
    ON variants_status USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS variants
(
    variant character varying COLLATE pg_catalog."default",
    variant_id bigint,
    frequency bigint,
    occurences_percent double precision,
    analysis_id character varying COLLATE pg_catalog."default",
    "bucketedFrequency" double precision,
    "bucketedFrequency_label" character varying COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_variants
    ON variants USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS attributes_binary
(
    analysis_id character varying COLLATE pg_catalog."default",
    content bytea,
    content_type character varying COLLATE pg_catalog."default"
) WITH (
      OIDS = FALSE
  )
TABLESPACE pg_default;
  CREATE INDEX IF NOT EXISTS idx_attributes_binary
      ON attributes_binary USING btree
      (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
      TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS metrics
(
    num_of_events bigint,
    num_of_cases bigint,
    num_of_activities bigint,
    avgtime double precision,
    mediantime double precision,
    num_of_variants bigint,
    max_activities bigint,
    min_activities bigint,
    analysis_id character varying COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS events
(
    case_id character varying COLLATE pg_catalog."default" NOT NULL,
    activity_id bigint,
    activity_start_timestamp timestamp without time zone,
    activity_end_timestamp timestamp without time zone,
    resource_id character varying COLLATE pg_catalog."default",
	resource_group character varying COLLATE pg_catalog."default",
    requester character varying COLLATE pg_catalog."default",
    scheduled_start  timestamp without time zone,
    scheduled_end  timestamp without time zone,
    duration_days integer,
    duration_sec bigint,
    next_activity_id bigint,
    next_resource_id character varying COLLATE pg_catalog."default",
	next_resource_group character varying COLLATE pg_catalog."default",
    repeat_self_loop_flag integer,
    redo_self_loop_flag integer,
    start_flag integer,
    end_flag integer,
    analysis_id character varying COLLATE pg_catalog."default",
    row_id bigint
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_events
    ON events USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS cases
(
    variant_id bigint,
    case_id character varying COLLATE pg_catalog."default",
    case_start_timestamp timestamp without time zone,
    case_end_timestamp timestamp without time zone,
    total_case_duration bigint,
    activities_per_case bigint,
    analysis_id character varying COLLATE pg_catalog."default",
    "bucketedDuration" double precision,
    "bucketedDuration_label" character varying COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_cases
    ON cases USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS activities
(
    analysis_id character varying COLLATE pg_catalog."default",
    activity_name character varying COLLATE pg_catalog."default",
    id bigint,
    total_occurrences bigint,
    total_first bigint,
    total_last bigint,
    "isEnd" integer,
    "isStart" integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_activities
    ON activities USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST, id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE OR REPLACE FUNCTION get_variants_status(
	in_analysis_id character varying,
	in_timestamp character varying)
    RETURNS TABLE(analysis_id character varying, variant_id bigint, label character varying, case_type character varying, case_state character varying, is_reference integer, "timestamp" timestamp without time zone)
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE
    ROWS 1000
AS $BODY$
BEGIN
	return query
		SELECT
			v.analysis_id,
			v.variant_id,
			v."label",
			v.case_type,
			v.case_state,
			v."isReference",
			v."timestamp"
		FROM
			variants_status v
		WHERE
			v.analysis_id = in_analysis_id;
END;
$BODY$;

CREATE TABLE datasets
(
    dataset_id character varying COLLATE pg_catalog."default",
    content bytea,
    content_type character varying COLLATE pg_catalog."default",
    CONSTRAINT datasets_pkey PRIMARY KEY (dataset_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

-- Insert dummy data
DELETE FROM attributes_binary WHERE analysis_id = 'PAM-000000';
DELETE FROM events WHERE analysis_id = 'PAM-000000';
DELETE FROM cases WHERE analysis_id = 'PAM-000000';
DELETE FROM metrics WHERE analysis_id = 'PAM-000000';
DELETE FROM variants WHERE analysis_id = 'PAM-000000';
DELETE FROM variants_status WHERE analysis_id = 'PAM-000000';
DELETE FROM activities WHERE analysis_id = 'PAM-000000';
INSERT INTO activities VALUES ('PAM-000000', 'A', 1, 1,1,0,0,1 );
INSERT INTO activities VALUES ('PAM-000000', 'B', 2, 1,0,0,0,0 );
INSERT INTO activities VALUES ('PAM-000000', 'C', 3, 1,0,1,1,0 );
INSERT INTO metrics VALUES (3, 1, 3, 60.0,60.0,1,3,3,'PAM-000000');
INSERT INTO cases VALUES (1, 'ID1', '2000-01-01 00:00:00','2000-01-01 00:01:00', 60, 3, 'PAM-000000');
INSERT INTO variants VALUES ('1,2,3',1,1,1.0,'PAM-000000');
INSERT INTO variants_status VALUES ('PAM-000000',1, 'Unchecked', 'None', 'None', '2000-01-01 00:00:00', 'None', 0);
INSERT INTO events VALUES('ID1', 1, '2000-01-01 00:00:00', '2000-01-01 00:00:15', 'HAL9000', 'Discovery One', 'Dave Bowman', '2000-01-01 00:00:00', '2000-01-01 00:00:15', 0, 15, 2, 'HAL9000', 'Discovery One', 0, 0, 1, 0, 'PAM-000000', 1);
INSERT INTO events VALUES('ID1', 2, '2000-01-01 00:00:16', '2000-01-01 00:00:30', 'HAL9000', 'Discovery One', 'Dave Bowman', '2000-01-01 00:00:16', '2000-01-01 00:00:30', 0, 15, 3, 'HAL9000', 'Discovery One', 0, 0, 0, 0, 'PAM-000000', 2);
INSERT INTO events VALUES('ID1', 3, '2000-01-01 00:00:31', '2000-01-01 00:01:00', 'HAL9000', 'Discovery One', 'Dave Bowman', '2000-01-01 00:00:31', '2000-01-01 00:01:00', 0, 30, null, null, null, 0, 0, 0, 1,'PAM-000000', 3);
INSERT INTO datasets (dataset_id, content, content_type) VALUES ('0', decode('1f8b0800000000000003e556516bdb301056eda469eaa52d04c61efb0716b297b1bd8c2631a5818c069242df8290154f104b9e24a7a44ffd2bfb277b6b1f0afd07fb279b27db921bbbcdd63d986ecc60eeee93eebbd371f2f97c170060839a7aedba5241fd6c7afcfa9dc2daca7000b00ef486a6925b03a3f48dd203a066258a065e4e4226e784e3015b4401fd882574a1848aa89dee02a0a5252879d6290cb050cac11af82a244b263b88d139f1238ebd90092209a36aed47f61632b487ee9b0d6a1a6d2bde9c891597838fd3e0833cf8f841707b2fa1efddbefd72770540226f4026bf3e724279c9282e05b1cfa683f23eb480c254c2d260637c3a199e23a9cdedd494559fea9b3ecd9d96d75786d72ef3de1fa4163f63ee8576689cf446efbbddee6fccea1369b94420b6c47c7578aa5ae0e960f5a9392e5ce2c33ebb08207d22f46c57e96f6dba7ffac2b4d266283c95c4496b74f4216339ea146535310b7e8ef6db81489225912b536c04059e11cfd09ae5999090cb99246a2c49188466c2e5eb987a0f561d8e058b385a23dccb219fb3c86c6c72fc3952ae986b605fa04fd88b16d8cb029befc13dace219d08b384c8e3af3e04a68f0450e0a8c4a23a5c9d945c70cd8a4b056d297711c7f2f75a071d8f5d4d4eeccb9722951ed4ffaeef130081997d35598105aebd5dd9e484ea8ffa8b5a37e05f054556c83fd2bdf3f636a0ca9c47e5e5b67c4a86fa0ffba2bb29bf113998449daf7090000', 'hex'), 'RDS')
