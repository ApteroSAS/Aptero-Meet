import configs from "./utils/configs";
import * as Sentry from '@sentry/browser';
//import { CaptureConsole } from '@sentry/integrations';
import {CaptureConsoleSentry} from "./aptero/module/telemetry/CaptureConsoleSentry";

const ga = window.ga;

export function showReportDialog(){
  throw new Error("sentry-report-dialog");
}

export default function registerTelemetry(trackedPage, trackedTitle) {
  const sentryDsn = configs.SENTRY_DSN;
  const gaTrackingId = configs.GA_TRACKING_ID;

  if (sentryDsn) {
    console.log("Tracking: Sentry DSN: " + sentryDsn);
    Sentry.init({
      dsn:sentryDsn,
      integrations: [
        new CaptureConsoleSentry({
          levels: ['log', 'info', 'warn', 'error']
        }),
        /*new CaptureConsole({
          levels: ['log', 'info', 'warn', 'error']
        })*/
      ],
      environment:configs.SENTRY_ENV || "web_default",
      release: process.env.BUILD_VERSION,
      beforeSend(event) {
        // Check if it is an exception, and if so, show the report dialog
        if (event.exception && event.exception.values[0].value === "sentry-report-dialog") {
          Sentry.showReportDialog({ eventId: event.event_id });
          console.log("report send");
        }
        return event;
      },
    });
  }

  if (ga && gaTrackingId) {
    console.log("Tracking: Google Analytics ID: " + gaTrackingId);

    ga("create", gaTrackingId, "auto");

    if (trackedPage) {
      ga("set", "page", trackedPage);
    }

    if (trackedTitle) {
      ga("set", "title", trackedTitle);
    }

    ga("send", "pageview");
  }
}
