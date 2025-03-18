
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  // Page loading state - shows while checking auth status
  const [pageLoading, setPageLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  
  // Auth store state and methods
  const {
    user,
    isLoading,
    isVerifying,
    error,
    phoneNumber,
    sendOTP,
    verifyOTP,
    clearError,
    validateSession
  } = useTwilioAuthStore();

  <div>
  <section class="elementor-section elementor-inner-section elementor-element elementor-element-3e0fc571 elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="3e0fc571" data-element_type="section">
						<div class="elementor-container elementor-column-gap-no">
					<div class="elementor-column elementor-col-50 elementor-inner-column elementor-element elementor-element-3f5aada6" data-id="3f5aada6" data-element_type="column">
			<div class="elementor-widget-wrap elementor-element-populated">
								<div class="elementor-element elementor-element-5b10b4b3 elementor-widget elementor-widget-heading" data-id="5b10b4b3" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h3 class="elementor-heading-title elementor-size-default">Address</h3>		</div>
				</div>
				<div class="elementor-element elementor-element-2f1ac57d elementor-widget elementor-widget-text-editor" data-id="2f1ac57d" data-element_type="widget" data-widget_type="text-editor.default">
				<div class="elementor-widget-container">
			<style>/*! elementor - v3.14.0 - 18-06-2023 */
.elementor-widget-text-editor.elementor-drop-cap-view-stacked .elementor-drop-cap{background-color:#69727d;color:#fff}.elementor-widget-text-editor.elementor-drop-cap-view-framed .elementor-drop-cap{color:#69727d;border:3px solid;background-color:transparent}.elementor-widget-text-editor:not(.elementor-drop-cap-view-default) .elementor-drop-cap{margin-top:8px}.elementor-widget-text-editor:not(.elementor-drop-cap-view-default) .elementor-drop-cap-letter{width:1em;height:1em}.elementor-widget-text-editor .elementor-drop-cap{float:left;text-align:center;line-height:1;font-size:50px}.elementor-widget-text-editor .elementor-drop-cap-letter{display:inline-block}</style>				<p>2 College Road #02-00,<br>Singapore 169850</p>						</div>
				</div>
					</div>
		</div>
				<div class="elementor-column elementor-col-50 elementor-inner-column elementor-element elementor-element-1050f1a3" data-id="1050f1a3" data-element_type="column">
			<div class="elementor-widget-wrap elementor-element-populated">
								<div class="elementor-element elementor-element-39e2bc28 elementor-widget elementor-widget-heading" data-id="39e2bc28" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h3 class="elementor-heading-title elementor-size-default">Email</h3>		</div>
				</div>
				<div class="elementor-element elementor-element-68ce1298 textDecorationNone elementor-widget elementor-widget-text-editor" data-id="68ce1298" data-element_type="widget" data-widget_type="text-editor.default">
				<div class="elementor-widget-container">
							<p><a href="mailto:info@precix.io">info@precix.io</a></p>						</div>
				</div>
					</div>
		</div>
							</div>
		</section>      
	  </div>
      <Footer />
    </div>
  );
}


