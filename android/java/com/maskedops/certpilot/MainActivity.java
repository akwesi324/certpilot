package com.maskedops.certpilot;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

/**
 * CertPilot for Android: the CertPilot web app in a WebView, signed in with the same account.
 * The server address is built in (build-apk.ps1 -ServerUrl) or entered on first launch.
 * Only pages on that server open inside the app; any other link opens in the browser.
 */
public class MainActivity extends Activity {
    private static final String PREFS = "certpilot";
    private static final int BG = Color.parseColor("#020617");

    private WebView webView;
    private ProgressBar progress;
    private String origin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        String url = prefs().getString("server", BuildConfigInfo.SERVER_URL);
        if (isAllowed(url)) openApp(url);
        else showSetup(null);
    }

    private SharedPreferences prefs() { return getSharedPreferences(PREFS, MODE_PRIVATE); }

    /** HTTPS anywhere; plain HTTP only for a computer on the local network (testing). */
    static boolean isAllowed(String url) {
        if (url == null || url.isEmpty()) return false;
        Uri u = Uri.parse(url);
        String host = u.getHost();
        if (host == null) return false;
        if ("https".equals(u.getScheme())) return true;
        if (!"http".equals(u.getScheme())) return false;
        return host.equals("localhost") || host.equals("10.0.2.2") || host.startsWith("192.168.") || host.startsWith("10.")
            || host.matches("172\\.(1[6-9]|2\\d|3[01])\\..*");
    }

    private static String originOf(String url) {
        Uri u = Uri.parse(url);
        return u.getScheme() + "://" + u.getAuthority();
    }

    // ------------------------------------------------------------------ setup screen

    private void showSetup(String message) {
        int pad = dp(24);
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER_VERTICAL);
        box.setPadding(pad, pad, pad, pad);
        box.setBackgroundColor(BG);

        TextView title = new TextView(this);
        title.setText("CertPilot");
        title.setTextColor(Color.WHITE);
        title.setTextSize(28);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        box.addView(title);

        TextView hint = new TextView(this);
        hint.setText(message != null ? message : "Enter the address of your CertPilot server, for example https://certpilot.vercel.app");
        hint.setTextColor(message != null ? Color.parseColor("#FCA5A5") : Color.parseColor("#94A3B8"));
        hint.setPadding(0, dp(8), 0, dp(16));
        box.addView(hint);

        EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        input.setSingleLine(true);
        input.setTextColor(Color.WHITE);
        input.setHintTextColor(Color.parseColor("#64748B"));
        input.setHint("https://");
        input.setText(prefs().getString("server", BuildConfigInfo.SERVER_URL));
        box.addView(input, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        Button go = new Button(this);
        go.setText("Continue");
        go.setOnClickListener(v -> {
            String url = input.getText().toString().trim().replaceAll("/+$", "");
            if (!url.matches("^[a-zA-Z]+://.*")) url = "https://" + url;
            if (!isAllowed(url)) {
                hint.setText("Use an https:// address (http:// only works for a computer on your local network).");
                hint.setTextColor(Color.parseColor("#FCA5A5"));
                return;
            }
            prefs().edit().putString("server", url).apply();
            openApp(url);
        });
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.topMargin = dp(16);
        box.addView(go, lp);

        TextView foot = new TextView(this);
        foot.setText("© MaskedOps 2026");
        foot.setTextColor(Color.parseColor("#64748B"));
        foot.setGravity(Gravity.CENTER);
        foot.setPadding(0, dp(32), 0, 0);
        box.addView(foot);

        if (webView != null) { webView.destroy(); webView = null; }
        setContentView(box);
    }

    // ------------------------------------------------------------------ the app

    private void openApp(String url) {
        origin = originOf(url);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        root.addView(progress, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(3)));

        webView = new WebView(this);
        webView.setBackgroundColor(BG);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setUserAgentString(s.getUserAgentString() + " CertPilotAndroid/" + BuildConfigInfo.VERSION);
        CookieManager.getInstance().setAcceptCookie(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (originOf(u.toString()).equals(origin)) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    showSetup("Could not reach " + origin + " (" + error.getDescription() + "). Check your connection or the server address.");
                }
            }

            @Override
            public void onPageFinished(WebView view, String u) {
                CookieManager.getInstance().flush(); // keep the session after the app is closed
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int p) {
                progress.setProgress(p);
                progress.setVisibility(p >= 100 ? View.GONE : View.VISIBLE);
            }
        });

        root.addView(webView, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);
        webView.loadUrl(origin + "/dashboard");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    private int dp(int v) { return Math.round(v * getResources().getDisplayMetrics().density); }
}
