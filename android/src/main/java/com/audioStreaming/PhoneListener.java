package com.audioStreaming;

import android.content.Context;
import android.content.Intent;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;

public class PhoneListener extends PhoneStateListener {

    private ReactNativeAudioStreamingModule module;
    /** Puede estar pausado y luego entrado la llamada, al finalizar la llamada empezaria a reproducir. Asi que agrego este flag */
    private boolean isPausadoEnLlamada = false;

    public PhoneListener(ReactNativeAudioStreamingModule module) {
        this.module = module;
    }

    @Override
    public void onCallStateChanged(int state, String incomingNumber) {
        switch (state) {
            case TelephonyManager.CALL_STATE_IDLE:

                if (!this.module.getSignal().isPlaying && isPausadoEnLlamada) {
                    // Intent restart = new Intent(this.module.getReactApplicationContextModule(), this.module.getClassActivity());
                    // restart.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    // this.module.getReactApplicationContextModule().startActivity(restart);
                    this.module.play();
                }
                break;
            case TelephonyManager.CALL_STATE_OFFHOOK:
            case TelephonyManager.CALL_STATE_RINGING:

                if (this.module.getSignal().isPlaying) {
                    this.module.stopOncall();
                    isPausadoEnLlamada = true;
                }
                break;
            default:
                break;
        }
        super.onCallStateChanged(state, incomingNumber);
    }

    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(Intent.ACTION_HEADSET_PLUG)) {
            if (this.module.getSignal().isPlaying) {
                this.module.stop();
            }
        }
    }
}
