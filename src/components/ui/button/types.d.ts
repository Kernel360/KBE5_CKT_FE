export type ButtonType = 'primary' | 'basic' | 'gray' | 'red';
export type IconPosition = 'left' | 'right';

export type StyledBasicButtonProps = Omit<BasicButtonProps, 'children' | 'buttonType'> & {
  $buttonType: ButtonType;
};

export type StyledIconButtonProps = Omit<IconButtonProps, 'children' | 'icon' | 'iconPosition'> & {
  $iconPosition: IconPosition;
};

export interface BasicButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
  buttonType?: ButtonType;
  width?: string;
}

export interface IconButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  width?: string;
}

export interface StyledActionButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  $buttonType?: ButtonType;
}
