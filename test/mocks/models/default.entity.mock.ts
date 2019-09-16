import { LogType } from '../../../src/application/domain/model/log'
import { ActivityLevelType } from '../../../src/application/domain/model/physical.activity.level'
import { SleepType } from '../../../src/application/domain/model/sleep'

export abstract class DefaultEntityMock {
    public static ACTIVITY: any = {
        id: '5d7a4c7d7b997bdf7601dcec',
        start_time: '2019-09-12T13:36:49.741Z',
        end_time: '2019-09-12T13:06:49.741Z',
        duration: 1800000,
        child_id: '5d7a4a95c292db05e4f765a8'
    }

    public static FITBIT_AUTH_DATA: any = {
        access_token: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJBMUIyM0MiLCJzdWIiOiJBQkMxMjMiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nl' +
            'c3NfdG9rZW4iLCJzY29wZXMiOiJyd2VpIHJhY3QgcnNsZSIsImV4cCI6MTU2ODE2MjQwMCwiaWF0IjoxNTY4MTMzNjAwfQ.QAMpCmHE6hJk' +
            '94a0UBOeqWWFXaOQpg4sZz08y89gmV0',
        expires_in: 1568162400,
        refresh_token: 'd6ccf77f84d342267f9f011d2e16fb9e',
        scopes: 'ract rsle rwei',
        token_type: 'Bearer',
        user_id: '5d7a4a95c292db05e4uf7658',
        last_sync: '2019-09-12T13:36:49.741Z',
        is_valid: true
    }

    public static USER_AUTH_DATA: any = {
        id: '5d7aa5125b593e3f113d190f',
        user_id: '5d7a4a95c292db05e4uf7658',
        fitbit: DefaultEntityMock.FITBIT_AUTH_DATA
    }

    public static LOG: any = {
        date: '2019-09-12',
        value: 2,
        type: LogType.CALORIES,
        child_id: '5d7a4a95c292db05e4f765a8'
    }

    public static USER_LOG: any = {
        steps: [{ ...DefaultEntityMock.LOG, type: LogType.STEPS }],
        calories: [{ ...DefaultEntityMock.LOG, type: LogType.CALORIES }],
        active_minutes: [{ ...DefaultEntityMock.LOG, type: LogType.ACTIVE_MINUTES }],
        lightly_active_minutes: [{ ...DefaultEntityMock.LOG, type: LogType.LIGHTLY_ACTIVE_MINUTES }],
        sedentary_minutes: [{ ...DefaultEntityMock.LOG, type: LogType.SEDENTARY_MINUTES }]
    }

    public static MEASUREMENT: any = {
        id: '5d7a83720edb8097a73421ce',
        type: 'measurement',
        timestamp: '2019-09-12T13:36:49.741Z',
        value: 0,
        unit: 'unit',
        child_id: '5d7a4a95c292db05e4f765a8'
    }

    public static BODY_FAT: any = {
        ...DefaultEntityMock.MEASUREMENT,
        type: 'body_fat',
        value: 20,
        unit: '%'
    }

    public static WEIGHT: any = {
        ...DefaultEntityMock.MEASUREMENT,
        type: 'weight',
        value: 60,
        unit: 'kg',
        body_fat: 20
    }

    public static HEART_RATE_ZONE: any = {
        min: 80,
        max: 100,
        duration: 1000
    }

    public static PHYSICAL_ACTIVITY_HEART_RATE: any = {
        average: 90,
        out_of_range_zone: DefaultEntityMock.HEART_RATE_ZONE,
        fat_burn_zone: DefaultEntityMock.HEART_RATE_ZONE,
        cardio_zone: DefaultEntityMock.HEART_RATE_ZONE,
        peak_zone: DefaultEntityMock.HEART_RATE_ZONE
    }

    public static PHYSICAL_ACTIVITY_LEVEL: any = {
        name: ActivityLevelType.FAIRLY,
        duration: 1000
    }

    public static PHYSICAL_ACTIVITY: any = {
        ...DefaultEntityMock.ACTIVITY,
        name: 'Walk',
        calories: 200,
        steps: 1000,
        levels: [DefaultEntityMock.PHYSICAL_ACTIVITY_LEVEL],
        heart_rate: DefaultEntityMock.PHYSICAL_ACTIVITY_HEART_RATE
    }

    public static RESOURCE: any = {
        id: '5d7a9fc8d3f5bbb30e0d6a1e',
        resource_id: '171847684',
        date_sync: '2019-09-12T13:36:49.741Z',
        user_id: '5d7a4a95c292db05e4uf7658',
        provider: 'Fitbit'
    }

    public static SLEEP_PATTERN_SUMMARY_DATA: any = {
        count: 10,
        duration: 10000
    }

    public static SLEEP_PATTERN_STAGES_SUMMARY: any = {
        deep: DefaultEntityMock.SLEEP_PATTERN_SUMMARY_DATA,
        light: DefaultEntityMock.SLEEP_PATTERN_SUMMARY_DATA,
        rem: DefaultEntityMock.SLEEP_PATTERN_SUMMARY_DATA,
        wake: DefaultEntityMock.SLEEP_PATTERN_SUMMARY_DATA
    }

    public static SLEEP_PATTERN_PHASES_SUMMARY: any = {
        awake: DefaultEntityMock.SLEEP_PATTERN_SUMMARY_DATA,
        asleep: DefaultEntityMock.SLEEP_PATTERN_SUMMARY_DATA,
        restless: DefaultEntityMock.SLEEP_PATTERN_SUMMARY_DATA
    }

    public static SLEEP_PATTERN_DATA_SET: any = {
        start_time: '2019-09-12T13:36:49.741Z',
        name: 'asleep',
        duration: 10000
    }

    public static SLEEP_PATTERN_PHASES: any = {
        data_set: [DefaultEntityMock.SLEEP_PATTERN_DATA_SET],
        summary: DefaultEntityMock.SLEEP_PATTERN_PHASES_SUMMARY
    }

    public static SLEEP_PATTERN_STAGES: any = {
        data_set: [DefaultEntityMock.SLEEP_PATTERN_DATA_SET],
        summary: DefaultEntityMock.SLEEP_PATTERN_STAGES_SUMMARY
    }

    public static SLEEP: any = {
        ...DefaultEntityMock.ACTIVITY,
        pattern: DefaultEntityMock.SLEEP_PATTERN_PHASES,
        type: SleepType.CLASSIC
    }
}
