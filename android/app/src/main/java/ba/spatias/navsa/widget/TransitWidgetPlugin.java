package ba.spatias.navsa.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

@CapacitorPlugin(name = "TransitWidget")
public class TransitWidgetPlugin extends Plugin {

    private static final String PREFS_NAME = "navsa_widget_prefs";

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        try {
            Context context = getContext();
            String lineId = call.getString("lineId", "3");
            String lineType = call.getString("lineType", "tram");
            String destination = call.getString("destination", "Sarajevo");
            String operator = call.getString("operator", "GRAS");
            String etaText = call.getString("etaText", "🟢 Uživo ~2 min");
            String statusText = call.getString("statusText", "🟢 Dolazi prema vama");
            String stationName = call.getString("stationName", "📍 Vaša stanica");
            int progress = call.getInt("progress", 70);

            String now = new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date());

            SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
            editor.putString("line_id", lineId);
            editor.putString("line_type", lineType);
            editor.putString("destination", destination);
            editor.putString("operator", operator);
            editor.putString("eta_text", etaText);
            editor.putString("status_text", statusText);
            editor.putString("station_name", stationName);
            editor.putInt("progress", progress);
            editor.putString("updated", now);
            editor.apply();

            TransitWidgetProvider.updateAllWidgets(context);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update widget: " + e.getMessage());
        }
    }

    @PluginMethod
    public void requestPinWidget(PluginCall call) {
        try {
            Context context = getContext();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AppWidgetManager appWidgetManager = context.getSystemService(AppWidgetManager.class);
                ComponentName provider = new ComponentName(context, TransitWidgetProvider.class);
                if (appWidgetManager.isRequestPinAppWidgetSupported()) {
                    boolean result = appWidgetManager.requestPinAppWidget(provider, null, null);
                    JSObject ret = new JSObject();
                    ret.put("success", result);
                    ret.put("supported", true);
                    call.resolve(ret);
                    return;
                }
            }

            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("supported", false);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to request pin widget: " + e.getMessage());
        }
    }
}
