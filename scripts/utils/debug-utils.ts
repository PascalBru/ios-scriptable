export enum LOG_LEVEL {DEBUG = 1, INFO, WARN}

export const log = (level: number, actLevel:number, message: string) => {
    if(actLevel <= level){
        if(actLevel == LOG_LEVEL.WARN){
            console.error(message);
        }
        else {
            console.log(message);
        }
    }
}

export const logObject = (level: number, actLevel:number, o: object) => {
    if(actLevel <= level){
        if(actLevel == LOG_LEVEL.WARN){
            console.error(o);
        }
        else {
            console.log(o);
        }
    }
}

export const logJSON = (level: number, actLevel:number, message: string, obj: any) => {
    if(actLevel <= level){
        if(actLevel == LOG_LEVEL.WARN){
            console.error(message + ': '+ JSON.stringify(obj));
        }
        else {
            console.log(message + ': '+ JSON.stringify(obj));
        }
    }
}

export const logTimeDate = (level: number, actLevel:number, message: string, date: Date) => {
    let dstr = date.toLocaleTimeString([], {
        weekday: 'short', day: '2-digit', month: '2-digit'
    });
    log(level, actLevel, message + ' ' + dstr);
}

export const logDate = (level: number, actLevel:number, message: string, date: Date, reverse: boolean = false) => {
    let dstr = date.toLocaleDateString([], {
        weekday: 'short', day: '2-digit', month: '2-digit'
    });
    if(reverse) {
        log(level, actLevel, dstr + ' ' + message);
    }
    else {
        log(level, actLevel, message + ' ' + dstr);
    }
}

export const logToWidget = (level: number, actLevel:number, widget: ListWidget, message: any) => {
    log(level, actLevel, message);
    if(widget !== undefined){
        let a = widget.addText(message)
        a.textColor = Color.red()
        a.textOpacity = 0.8
        a.font = Font.systemFont(10)
    }
}