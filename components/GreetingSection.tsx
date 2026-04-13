import * as React from "react";

interface GreetingSectionProps {
  customGreeting?: string;
}

export const GreetingSection: React.FC<GreetingSectionProps> = ({ customGreeting }) => {
  const [greeting, setGreeting] = React.useState("");

  React.useEffect(() => {
    if (customGreeting) {
      setGreeting(customGreeting);
      return;
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [customGreeting]);

  return (
    <div className="greeting-section">
      <h1>{greeting}</h1>
      <div className="date-display">
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  );
};
