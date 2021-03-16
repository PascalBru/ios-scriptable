import { log, LOG_LEVEL } from "scripts/utils/debug-utils";

interface IAlertParams {
    title: string;
    message: string;
    inputFields?: string[];
}

export class InputTextAlert {
    logLevel: number;
    params: IAlertParams;

    constructor(logLevel: number, params: IAlertParams) {
        this.logLevel = logLevel;
        this.params = params;
    }

    async present(): Promise<string[]> {

        const alert = new Alert();
        alert.title = this.params.title;
        alert.message = this.params.message;
        if (this.params.inputFields != undefined) {
            this.params.inputFields.forEach(inputField => {
                alert.addTextField(inputField);
            });
        }
        alert.addAction('OK')
        alert.addCancelAction('Cancel')
        let alertR = await alert.present();
        const ret: string[] = [];
        if (alertR != -1) {
            log(LOG_LEVEL.DEBUG, this.logLevel, 'OK selected (' + this.params.title + ')')
            if (this.params.inputFields != undefined) {
                for (var i = 0; i < this.params.inputFields.length; i++) {
                    ret.push(alert.textFieldValue(i))
                }
            }
        }

        return new Promise((resolve) => {
            resolve(ret);
        });;;
    }
}

export class QuestionAlert {
    logLevel: number;
    params: IAlertParams;

    constructor(logLevel: number, params: IAlertParams) {
        this.logLevel = logLevel;
        this.params = params;
    }

    async present(): Promise<boolean> {

        const alert = new Alert();
        alert.title = this.params.title;
        alert.message = this.params.message;
        alert.addAction('Yes')
        alert.addCancelAction('No')
        let alertR = await alert.present();
        let ret: boolean = false;
        if (alertR != -1) {
            log(LOG_LEVEL.DEBUG, this.logLevel, 'Yes selected (' + this.params.title + ')')
            ret = true;
        }

        return new Promise((resolve) => {
            resolve(ret);
        });;;
    }
}