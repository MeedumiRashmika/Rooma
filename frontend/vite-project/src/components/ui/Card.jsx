
import "./Card.css";

function Card({
  as: Component = "div",
  children,
  variant = "default",
  padding = "medium",
  className = "",
  ...props
}) {
  const cardClassName = [
    "rooma-ui-card",
    `rooma-ui-card--${variant}`,
    `rooma-ui-card--padding-${padding}`,
    className
  ].filter(Boolean).join(" ");

  return (
    <Component className={cardClassName} {...props}>
      {children}
    </Component>
  );
}

export default Card;
