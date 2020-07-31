import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionsUtils } from './functions-utils';
admin.initializeApp();

exports.createUserAsAdmin = FunctionsUtils.builder.https.onCall(async (data, context) => {
  const userRecord = await admin.auth().createUser({
    email: data.email,
    emailVerified: false,
    displayName: data.name,
    disabled: false
  });

  return admin.firestore().collection('employees').doc(userRecord.uid).set({
    email: userRecord.email,
    displayName: userRecord.displayName,
    role: data.role,
    uid: userRecord.uid,
  });

});

exports.validateAdminPassword = FunctionsUtils.builder.https.onCall(async (data: { password: string }) => {
  const configRef = admin.firestore().collection('configurations').doc('configs');
  const configSnap = await configRef.get();
  const config = configSnap.data();
  return Promise.resolve(config ? config.adminPassword === data.password : false);
});

// move this block to another file and reuse in other functions
export interface HandleCallOptions {
  requireAuth?: boolean;
  possibleRoles?: string[];
}

export async function handleCall(context: functions.https.CallableContext, options: HandleCallOptions, f: () => Promise<any>) {
  try {
    // check auth
    if (options.requireAuth === true) {
      // check auth state
      if (context.auth === undefined) {
        throw new functions.https.HttpsError('unauthenticated', 'Called function require authentication');
      }

      // check user role
      if (options.possibleRoles !== undefined && options.possibleRoles.length > 0) {
        // TODO get user roles from custom claims (context.auth.token) rather then directly from firestore
        const userRef = admin.firestore().collection('employees').doc(context.auth.uid);
        const userSnap = await userRef.get();
        const user = userSnap.data();
        // double check just for ts-lint
        if (!userSnap.exists || user === undefined) {
          throw new functions.https.HttpsError('failed-precondition', 'Could not get user data');
        }

        if (options.possibleRoles.indexOf(user.role) === -1) {
          throw new functions.https.HttpsError('permission-denied', 'User has insufficient permissions to call this function');
        }
      }
    }

    // call function
    return await f();
  } catch (error) {
    console.error(error);

    if (error instanceof functions.https.HttpsError) throw error;

    if (error instanceof Error) throw new functions.https.HttpsError('internal', error.message);

    throw new functions.https.HttpsError('unknown', JSON.stringify(error));
  }
}

interface DeleteAnonymsData {
  anonymIds: string[];
}

export const deleteAnonymsAndMoveToPresents = FunctionsUtils.builder.https.onCall(async (data: DeleteAnonymsData, context) => {
  return await handleCall(context, {
    requireAuth: true
  }, async () => {
    // get user data for storeID and user Role
    const userRef = admin.firestore().collection('employees').doc((context.auth as { uid: string }).uid);
    const userSnap = await userRef.get();
    const user = userSnap.data();

    if (!user) {
      throw new functions.https.HttpsError('failed-precondition', 'could not recieve user data');
    }

    const storeId = user.storeId;
    await Promise.all(data.anonymIds.map(anonymId => deleteAnonymAndUpdatetechnicalStuffTransaction(anonymId, storeId)));
    return 'SUCCESS';
  });
});

export async function deleteAnonymAndUpdatetechnicalStuffTransaction(anonymId: string, storeId: string) {
  // get Anonym ref for anonym data and deletion
  const anonymRef = admin.firestore().collection(`stores/${storeId}/anonyms`).doc(anonymId);

  await admin.firestore().runTransaction((transaction) => {
    return transaction.get(anonymRef).then((doc) => {
      const anonymData = doc.data();

      if (!anonymData) {
        throw new functions.https.HttpsError('failed-precondition', 'could not recieve anonym data');
      }

      // set data for technicalStuff update
      const technicalStuffData = {
        technicalStuff: anonymData.technicalStuff2,
        otherTechnicalStuff: anonymData.otherTechnicalStuff,
        type: anonymData.type,
        status: 'unfulfilled',
        customerName: '',
        customerPhone: '',
        technicalStuffAnonym: '',
        typeAnonym: '',
        otherTechnicalStuffAnonym: '',
        note: 'Zmazana ',
        movedFromAnonymAt: admin.firestore.FieldValue.serverTimestamp(),
        movedFromAnonym: true,
      };

      const technicalStuffRef = admin.firestore().collection(`stores/${storeId}/technicalStuffs`).doc(anonymData.technicalStuffId);
      // update technicalStuff
      transaction.update(technicalStuffRef, technicalStuffData);
      // delete exchnage
      transaction.delete(anonymRef);
    });
  });
}
