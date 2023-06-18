export interface MenuPosition {
  left?: boolean
  right?: boolean
  top?: boolean
  bottom?: boolean
}

export interface MenuButton {
  icon: string
  text: string
  color: string
  function: Function
}

export interface MenuSection {
  buttons: MenuButton[]
}
