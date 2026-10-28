import { LightningElement, api } from 'lwc';

const APP_URL = 'https://trailsignup-b74685fca0428d--c.my.salesforce.app/app/c__OpportunityManager';

export default class OpportunityManagerEmbed extends LightningElement {
    @api recordId;

    get embeddingUrl() {
        return this.recordId ? `${APP_URL}?accountId=${encodeURIComponent(this.recordId)}` : null;
    }
}
