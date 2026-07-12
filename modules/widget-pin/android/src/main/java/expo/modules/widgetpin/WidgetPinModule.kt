package expo.modules.widgetpin

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WidgetPinModule : Module() {
  private fun manager(): AppWidgetManager? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return null
    val context = appContext.reactContext ?: return null
    return context.getSystemService(AppWidgetManager::class.java)
  }

  override fun definition() = ModuleDefinition {
    Name("WidgetPin")

    Function("isPinSupported") {
      manager()?.isRequestPinAppWidgetSupported ?: false
    }

    Function("requestPin") { providerClassName: String ->
      val context = appContext.reactContext ?: return@Function false
      val mgr = manager() ?: return@Function false
      if (!mgr.isRequestPinAppWidgetSupported) return@Function false
      try {
        mgr.requestPinAppWidget(ComponentName(context.packageName, providerClassName), null, null)
      } catch (e: Exception) {
        false
      }
    }
  }
}
