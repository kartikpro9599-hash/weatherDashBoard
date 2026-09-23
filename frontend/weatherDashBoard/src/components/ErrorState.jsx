import { CloudOff, WifiOff, SearchX, RefreshCw } from "lucide-react";
import "./ErrorState.css";

const ERROR_MAP = {
  "city not found": {
    icon: SearchX,
    heading: "City Not Found",
    message: "Check the spelling and try again.",
  },
  "no details found": {
    icon: SearchX,
    heading: "City Not Found",
    message: "We couldn't find that city. Double-check the name and try again.",
  },
  "invalid city name": {
    icon: SearchX,
    heading: "Invalid City Name",
    message: "Please enter a valid city name.",
  },
  "can't connect": {
    icon: WifiOff,
    heading: "Connection Error",
    message: "Please check your internet connection and try again.",
  },
  "timed out": {
    icon: WifiOff,
    heading: "Request Timed Out",
    message: "The server took too long to respond. Please try again.",
  },
};

function getErrorDetails(errorMessage) {
  if (!errorMessage) {
    return {
      icon: CloudOff,
      heading: "Something Went Wrong",
      message: "An unexpected error occurred. Please try again.",
    };
  }

  const lower = errorMessage.toLowerCase();

  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  return {
    icon: CloudOff,
    heading: "Something Went Wrong",
    message: errorMessage,
  };
}

export default function ErrorState({ error, onRetry }) {
  const { icon: Icon, heading, message } = getErrorDetails(error);

  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon-wrapper">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="error-state__heading">{heading}</h3>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <button className="error-state__retry-btn" onClick={onRetry}>
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}
