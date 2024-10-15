import { log, logJSON, LOG_LEVEL } from "scripts/utils/debug-utils";
import { updatedAt } from "scripts/utils/date-utils"

export interface IWidgetParams {
    widgetParameter: string;
    widgetSize: "small" | "medium" | "large" | "extraLarge" | "accessoryRectangular" | "accessoryInline" | "accessoryCircular" | null;
}

export interface IWidgetModule {
    createWidget: (params: IWidgetParams) => Promise<ListWidget>;
}

export abstract class WidgetHelper {

    _createWidget(logLevel: number, params: IWidgetParams): Promise<ListWidget> {
        logJSON(logLevel, LOG_LEVEL.INFO, 'createWidget', params);
        return this.createWidget(params);
    }

    abstract createWidget(params: IWidgetParams): Promise<ListWidget>;

    async startWidget(logLevel: number) {
        try {
            let widget: any;
            if (config.runsInWidget) {
                widget = await this._createWidget(logLevel, { widgetParameter: args.widgetParameter, widgetSize: config.widgetFamily });
            } else {
                // For debugging
                const alert = new Alert();
                alert.title = 'Widget-Size';
                alert.message = 'Choose size of widget!';
                alert.addAction('small');
                alert.addAction('medium');
                alert.addAction('large');
                let alertR = await alert.present();
                const size = alertR == 0 ? 'small' : alertR == 1 ? 'medium' : 'large';
                widget = await this._createWidget(logLevel, { widgetParameter: args.widgetParameter, widgetSize: size });
                if (size == 'small') {
                    widget.presentSmall();
                } else if (size == 'medium') {
                    widget.presentMedium();
                } else {
                    widget.presentLarge();
                }
            }
            Script.setWidget(widget);
            Script.complete();
        } catch (error) {
            log(LOG_LEVEL.WARN, logLevel, error)
        }
    }
}

export const addTitle = (widget: ListWidget, title: string) => {
    const t = widget.addText(title);
    t.font = Font.headline();
    t.centerAlignText();
    widget.addSpacer();
}

export const addTextCentered = (widget: ListWidget, text: string, size: number = 20) => {
    const t = widget.addText(text);
    t.font = Font.boldRoundedSystemFont(size);
    t.centerAlignText();
}

export const addStackText = (widget: ListWidget, text1: string, text2: string = '', url: string = '') => {
    var s = widget.addStack()
    s.addText(text1);
    if (text2 != '') {
        s.addSpacer();
        s.addText(text2);
    }
    if (url != '') {
        s.url = url;
    }
}

export const addUpdateFooter = (widget: ListWidget, lastUpdate: Date) => {
    widget.addSpacer();
    let date = widget.addText(`Stand ${updatedAt(lastUpdate)}`);
    date.font = Font.footnote();
    date.centerAlignText();
}

export const drawContextLine = (dc: DrawContext,  start:Point, end: Point, c: Color, lineWidth: number) => {
    const path = new Path();
    path.move(start);
    path.addLine(end);
    dc.addPath( path );
    dc.setStrokeColor( c );
    dc.setLineWidth(lineWidth);
    dc.strokePath();
}

export function getWidgetSizeInPoint(widgetSize = (config.runsInWidget ? config.widgetFamily : null)): Size {
    // RegExp to verify widgetSize
    const sizes = /^(?:small|medium|large)$/
    // stringify device screen size
    const devSize = (({width: w, height: h}) => w > h ? `${h}x${w}` : `${w}x${h}`)(Device.screenSize())
    // screen size to widget size mapping for iPhone, excluding the latest iPhone 12 series. iPad size
    const sizeMap = {
      // Macbook
      '900x1440': { small: [170, 170], medium: [332, 170], large: [382, 332] },
      // iPad Mini 2/3/4, iPad 3/4, iPad Air 1/2. 9.7" iPad Pro
      // '768x1024': { small: [0, 0], medium: [0, 0], large: [0, 0] },
      // 10.2" iPad
      // '810x1080': { small: [0, 0], medium: [0, 0], large: [0, 0] },
      // 10.5" iPad Pro, 10.5" iPad Air 3rd Gen
      // '834x1112': { small: [0, 0], medium: [0, 0], large: [0, 0] },
      // 10.9" iPad Air 4th Gen
      // '820x1180': { small: [0, 0], medium: [0, 0], large: [0, 0] },
      // 11" iPad Pro
      '834x1194': { small: [155, 155], medium: [329, 155], large: [345, 329] },
      // 12.9" iPad Pro
      '1024x1366': { small: [170, 170], medium: [332, 170], large: [382, 332] },
      // 12 Pro Max
      // '428x926': { small: [0, 0], medium: [0, 0], large: [0, 0] },
      // XR, 11, 11 Pro Max
      '414x896': { small: [169, 169], medium: [360, 169], large: [360, 376] },
      // 12, 12 Pro
      '390x844': { small: [169, 169], medium: [360, 169], large: [360, 376] },
      // X, XS, 11 Pro, 12 Mini
      '375x812': { small: [155, 155], medium: [329, 155], large: [329, 345] },
      // 6/7/8(S) Plus
      '414x736': { small: [159, 159], medium: [348, 159], large: [348, 357] },
      // 6/7/8(S) and 2nd Gen SE
      '375x667': { small: [148, 148], medium: [322, 148], large: [322, 324] },
      // 1st Gen SE
      '320x568': { small: [141, 141], medium: [291, 141], large: [291, 299] }
    }
  
    if (widgetSize && sizes.test(widgetSize)) {
      let mappedSize = sizeMap[devSize]
      if (mappedSize) {
        return new Size(mappedSize[widgetSize][0], mappedSize[widgetSize][1])
      }
    }
    return new Size(0, 0);
  }