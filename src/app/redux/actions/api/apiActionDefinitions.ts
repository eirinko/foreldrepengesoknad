import Person from '../../../types/Person';
import Søknad, { Søknadsvedlegginfo } from '../../../types/søknad/Søknad';

export enum ApiActionKeys {
    'GET_PERSON_REQUEST' = 'getPersonRequest',
    'GET_PERSON_SUCCESS' = 'getPersonSuccess',
    'GET_PERSON_FAILED' = 'getPersonFailed',

    'SEND_SØKNAD_REQUEST' = 'sendSøknadRequest',
    'SEND_SØKNAD_SUCCESS' = 'sendSøknadSuccess',
    'SEND_SØKNAD_FAILED' = 'sendSøknadFailed'
}

interface GetPersonRequest {
    type: ApiActionKeys.GET_PERSON_REQUEST;
}

interface GetPersonSuccess {
    type: ApiActionKeys.GET_PERSON_SUCCESS;
    person: Person;
}

interface GetPersonFailed {
    type: ApiActionKeys.GET_PERSON_FAILED;
    error: any;
}

export interface SendSøknadRequest {
    type: ApiActionKeys.SEND_SØKNAD_REQUEST;
    søknad: Søknad;
    vedlegg: Søknadsvedlegginfo[];
}

interface SendSøknadSuccess {
    type: ApiActionKeys.SEND_SØKNAD_SUCCESS;
    response: any;
}

interface SendSøknadFailed {
    type: ApiActionKeys.SEND_SØKNAD_FAILED;
    error: any;
}

export type ApiActionTypes =
    | GetPersonRequest
    | GetPersonSuccess
    | GetPersonFailed
    | SendSøknadRequest
    | SendSøknadSuccess
    | SendSøknadFailed;
