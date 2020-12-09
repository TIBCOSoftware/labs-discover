/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
CREATE TABLE IF NOT EXISTS public.variants_status
(
    analysis_id text COLLATE pg_catalog."default" NOT NULL,
    variant_id bigint NOT NULL,
    label text COLLATE pg_catalog."default",
    case_type text COLLATE pg_catalog."default",
    case_state text COLLATE pg_catalog."default",
    "timestamp" timestamp without time zone,
    "LACaseRef" text COLLATE pg_catalog."default",
    "isReference" integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_variants_status
    ON public.variants_status USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS public.variants
(
    variant text COLLATE pg_catalog."default",
    variant_id bigint,
    frequency bigint,
    occurences_percent double precision,
    analysis_id text COLLATE pg_catalog."default",
    "bucketedFrequency" double precision,
    "bucketedFrequency_label" text COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_variants
    ON public.variants USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS public.metrics
(
    num_of_events bigint,
    num_of_cases bigint,
    num_of_activities bigint,
    avgtime double precision,
    mediantime double precision,
    num_of_variants bigint,
    max_activities bigint,
    min_activities bigint,
    analysis_id text COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS public.events
(
    case_id text COLLATE pg_catalog."default" NOT NULL,
    activity_id bigint,
    activity_start_timestamp timestamp without time zone,
    activity_end_timestamp timestamp without time zone,
    resource_id text COLLATE pg_catalog."default",
    duration_days integer,
    duration_sec bigint,
    next_activity_id bigint,
    next_resource_id text COLLATE pg_catalog."default",
    repeat_self_loop_flag integer,
    redo_self_loop_flag integer,
    start_flag integer,
    end_flag integer,
    analysis_id text COLLATE pg_catalog."default",
    row_id bigint
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_events
    ON public.events USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS public.cases
(
    variant_id bigint,
    case_id text COLLATE pg_catalog."default",
    case_start_timestamp timestamp without time zone,
    case_end_timestamp timestamp without time zone,
    total_case_duration bigint,
    activities_per_case bigint,
    analysis_id text COLLATE pg_catalog."default",
    "bucketedDuration" double precision,
    "bucketedDuration_label" text COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_cases
    ON public.cases USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS public.attributes
(
    analysis_id text COLLATE pg_catalog."default",
    row_id bigint,
    key text COLLATE pg_catalog."default",
    value text COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_attributes
    ON public.attributes USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS public.activities
(
    analysis_id text COLLATE pg_catalog."default",
    activity_name text COLLATE pg_catalog."default",
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
    ON public.activities USING btree
    (analysis_id COLLATE pg_catalog."default" ASC NULLS LAST, id ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE OR REPLACE FUNCTION public.get_variants_status(
	in_analysis_id text,
	in_timestamp text)
    RETURNS TABLE(analysis_id text, variant_id bigint, label text, case_type text, case_state text, is_reference integer, "timestamp" timestamp without time zone)
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE
    ROWS 1000
AS $BODY$
begin
	return query
		select
			v.analysis_id,
			v.variant_id,
			v."label",
			v.case_type,
			v.case_state,
			v."isReference",
			v."timestamp"
		from
			variants_status v
		where
			v.analysis_id = in_analysis_id;
end;
$BODY$;
delete from attributes where analysis_id = 'DIS_000000';
delete from events where analysis_id = 'DIS_000000';
delete from cases where analysis_id = 'DIS_000000';
delete from metrics where analysis_id = 'DIS_000000';
delete from variants where analysis_id = 'DIS_000000';
delete from variants_status where analysis_id = 'DIS_000000';
delete from activities where analysis_id = 'DIS_000000';
insert into attributes VALUES ('DIS_000000', 1 , 'key1' , 'value1');
insert into attributes VALUES ('DIS_000000', 1 , 'key2' , 'value2');
insert into attributes VALUES ('DIS_000000', 2 , 'key1' , 'value1');
insert into attributes VALUES ('DIS_000000', 2 , 'key2' , 'value2');
insert into attributes VALUES ('DIS_000000', 3 , 'key1' , 'value1');
insert into attributes VALUES ('DIS_000000', 3 , 'key2' , 'value2');
insert into activities VALUES ('DIS_000000', 'A', 1, 1,1,0,0,1 );
insert into activities VALUES ('DIS_000000', 'B', 2, 1,0,0,0,0 );
insert into activities VALUES ('DIS_000000', 'C', 3, 1,0,1,1,0 );
insert into metrics VALUES (3, 1, 3, 60.0,60.0,1,3,3,'DIS_000000');
insert into cases VALUES (1, 'ID1', '2000-01-01 00:00:00','2000-01-01 00:01:00', 60, 3, 'DIS_000000');
insert into variants VALUES ('1,2,3',1,1,1.0,'DIS_000000');
insert into variants_status VALUES ('DIS_000000',1, 'Unchecked', 'None', 'None', '2000-01-01 00:00:00', 'None', 0);
insert into events VALUES('ID1', 1, '2000-01-01 00:00:00', '2000-01-01 00:00:15', 'HAL9000', 0, 15, 2, 'HAL9000', 0, 0, 1, 0, 'DIS_000000', 1);
insert into events VALUES('ID1', 2, '2000-01-01 00:00:16', '2000-01-01 00:00:30', 'HAL9000', 0, 15, 3, 'HAL9000', 0, 0, 0, 0, 'DIS_000000', 2);
insert into events VALUES('ID1', 3, '2000-01-01 00:00:31', '2000-01-01 00:01:00', 'HAL9000', 0, 30, null, null, 0, 0, 0, 1,'DIS_000000', 3);