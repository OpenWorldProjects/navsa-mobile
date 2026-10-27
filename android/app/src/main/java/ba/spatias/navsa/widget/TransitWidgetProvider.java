package ba.spatias.navsa.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.widget.RemoteViews;

import ba.spatias.navsa.MainActivity;
import ba.spatias.navsa.R;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import org.json.JSONArray;
import org.json.JSONObject;

public class TransitWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_REFRESH = "ba.spatias.navsa.WIDGET_REFRESH";
    private static final String PREFS_NAME = "navsa_widget_prefs";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        if (ACTION_REFRESH.equals(intent.getAction())) {
            fetchLiveDataInBackground(context);
        }
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName thisWidget = new ComponentName(context, TransitWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        String lineId = prefs.getString("line_id", "3");
        String lineType = prefs.getString("line_type", "tram");
        String destination = prefs.getString("destination", "Ilidža ➔ Baščaršija");
        String operator = prefs.getString("operator", "GRAS #557");
        String etaText = prefs.getString("eta_text", "🟢 Stiže za ~2 min (450m)");
        String statusText = prefs.getString("status_text", "🟢 Dolazi prema vama");
        String updated = prefs.getString("updated", new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date()));

        String stationName = prefs.getString("station_name", "📍 Prema vašoj stanici");
        int progress = prefs.getInt("progress", 70);

        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        boolean isCompact = minWidth > 0 && minWidth < 180;

        int layoutId = isCompact ? R.layout.widget_transit_compact : R.layout.widget_transit_medium;
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);

        // 1. Line Badge & Color
        int badgeDrawable = R.drawable.widget_line_pill_yellow;
        if ("trolley".equalsIgnoreCase(lineType)) {
            badgeDrawable = R.drawable.widget_line_pill_orange;
        } else if ("bus".equalsIgnoreCase(lineType)) {
            badgeDrawable = R.drawable.widget_line_pill_blue;
        }

        views.setInt(R.id.widget_line_badge, "setBackgroundResource", badgeDrawable);
        views.setTextViewText(R.id.widget_line_badge, isCompact ? lineId : "Linija " + lineId);
        views.setTextViewText(R.id.widget_destination, destination);
        views.setTextViewText(R.id.widget_eta, etaText);
        views.setProgressBar(R.id.widget_progress, 100, Math.max(10, Math.min(100, progress)), false);

        if (!isCompact) {
            views.setTextViewText(R.id.widget_operator, operator);
            views.setTextViewText(R.id.widget_station, stationName);
            views.setTextViewText(R.id.widget_updated, updated);

            // Refresh button PendingIntent
            Intent refreshIntent = new Intent(context, TransitWidgetProvider.class);
            refreshIntent.setAction(ACTION_REFRESH);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(context, 0, refreshIntent, flags);
            views.setOnClickPendingIntent(R.id.widget_btn_refresh, refreshPendingIntent);
        } else {
            views.setTextViewText(R.id.widget_status, statusText);
        }

        // Click on widget root opens MainActivity
        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int launchFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            launchFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent launchPendingIntent = PendingIntent.getActivity(context, appWidgetId, launchIntent, launchFlags);
        views.setOnClickPendingIntent(R.id.widget_root, launchPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static void fetchLiveDataInBackground(final Context context) {
        new Thread(() -> {
            try {
                URL url = new URL("https://navsa.spatias.com/api/v1/vehicles");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);

                if (conn.getResponseCode() == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                    reader.close();

                    JSONArray vehicles = new JSONArray(sb.toString());
                    if (vehicles.length() > 0) {
                        JSONObject first = vehicles.getJSONObject(0);
                        String lineId = first.optString("line_id", "3");
                        String destination = first.optString("destination", "Sarajevo Centar");
                        String operator = first.optString("operator", "GRAS");
                        String vehicleCode = first.optString("vehicle_code", "557");
                        String lineType = "tram";
                        if (lineId.startsWith("10")) lineType = "trolley";
                        else if (lineId.length() > 2) lineType = "bus";

                        String now = new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date());

                        SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
                        editor.putString("line_id", lineId);
                        editor.putString("line_type", lineType);
                        editor.putString("destination", destination);
                        editor.putString("operator", operator + " #" + vehicleCode);
                        editor.putString("eta_text", "🟢 Uživo ~2 min");
                        editor.putString("status_text", "🟢 Dolazi prema stanici");
                        editor.putString("updated", now);
                        editor.apply();

                        updateAllWidgets(context);
                    }
                }
            } catch (Exception e) {
                // Silently handle network errors
            }
        }).start();
    }
}
