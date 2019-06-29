import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import apexSearch from '@salesforce/apex/LWCLookupController.search';// Apex method 

export default class CustomLookup extends LightningElement {
    // Use alerts instead of toast to notify user
    /* eslint-disable */
    @api label = '';
    @api placeholder = '';

    @api object = 'Account';
    @api field = 'Name';
    @api subField = 'CreatedDate';
    @api limit = 5;
    @api iconName = 'standard:default';

    @api notifyViaAlerts = false;
    @track isMultiEntry = false;

    @track errors = [];
    @track resultList;

    @api get multiSelect() {
        return this.multiSelect;
    }
    set multiSelect(value) {
        if (value.toLowerCase() === 'true') {
            this.isMultiEntry = true
        }
    }

    handleLookupTypeChange(event) {
        this.errors = [];
        this.isMultiEntry = event.target.checked;
    }

    handleSearch(event) {
        let searchDetails = JSON.parse(JSON.stringify(event.detail));
        let parameters = {
            'searchTerm': searchDetails.searchTerm,
            'selectedIds': searchDetails.selectedIds,
            'sObjectName': this.object,
            'field': this.field,
            'subField': this.subField,
            'maxResults': this.limit,
            'icon': this.iconName,
        }
        apexSearch(JSON.parse(JSON.stringify(parameters)))
            .then(results => {
                this.resultList = results;
            })
            .catch(error => {
                this.notifyUser('Lookup Error', 'An error occured while searching with the lookup field.', 'error');
                // eslint-disable-next-line no-console
                console.error('Lookup error', JSON.stringify(error));
                this.errors = [error];
            });
    }

    handleSelectionChange(event) {
        const selected = new CustomEvent('select', {
            detail: JSON.parse(JSON.stringify(event.detail))
        });
        this.dispatchEvent(selected);
        this.errors = [];
    }


    notifyUser(title, message, variant) {
        if (this.notifyViaAlerts) {
            // Notify via alert
            // eslint-disable-next-line no-alert
            alert(`${title}\n${message}`);
        } else {
            // Notify via toast
            const toastEvent = new ShowToastEvent({ title, message, variant });
            this.dispatchEvent(toastEvent);
        }
    }
}