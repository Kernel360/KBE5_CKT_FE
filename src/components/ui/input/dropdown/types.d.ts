export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface DropdownProps {
  id?: string;
  width?: string;
  label?: string;
  options: DropdownOption[];
  value?: string | number;
  errorText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onSelect?: (value: string | number) => void;
}

export interface FieldContainerProps {
  $width?: string;
}

export interface StyledDropdownContainerProps {
  $width?: string;
  $isDisabledOrReadOnly: boolean;
  $isError: boolean;
  $isOpen: boolean;
}

export interface DropdownIconProps {
  $isOpen: boolean;
}
