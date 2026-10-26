package ba.spatias.navsa;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import ba.spatias.navsa.widget.TransitWidgetPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TransitWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
