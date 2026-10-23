/**
 * DEPRECATED: Firebase Firestore has been phased out completely.
 * All operations now route through Cloudflare D1 Native Edge Data Service.
 */
import { d1DataService } from './d1DataService';

export const firestoreService = d1DataService;
export default d1DataService;
