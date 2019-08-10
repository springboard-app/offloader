import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
// @ts-ignore
import { version } from "../package.json";

@Injectable()
export class AppService {
  constructor() {
    // Reads from the FIREBASE_CONFIG and GOOGLE_APPLICATION_CREDENTIALS environment variables
    // See https://firebase.google.com/docs/admin/setup#initialize_without_parameters
    admin.initializeApp();
  }
  static getVersion(): string {
    return version;
  }
}
