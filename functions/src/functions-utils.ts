// import * as functions from 'firebase-functions';
// import { SUPPORTED_REGIONS } from 'firebase-functions';
import { region, SUPPORTED_REGIONS } from 'firebase-functions';

// import { CommonConfig } from ''; toto ked urobis config

export class FunctionsUtils {

  public static get builder() {
    return region('europe-west3' as typeof SUPPORTED_REGIONS[number]);
  }

}