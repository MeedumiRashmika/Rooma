
import "./Button.css";

function Button({
  as: Component = "button",
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const buttonClassName = [
    "rooma-ui-button",
    `rooma-ui-button--${variant}`,
    `rooma-ui-button--${size}`,
    fullWidth ? "rooma-ui-button--full" : "",
    className
  ].filter(Boolean).join(" ");

  // Supports React Router Link, e.g. as={Link}
  if (Component !== "button") {
    const { onClick, ...restProps } = props;

    return (
      <Component
        className={buttonClassName}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : restProps.tabIndex}
        onClick={
          disabled
            ? (event) => event.preventDefault()
            : onClick
        }
        {...restProps}
      >
        {children}
      </Component>
    );
  }

  return (
    <button
      type={type}
      className={buttonClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
