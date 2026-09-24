export type SelectionItem = {
  label: string;
  value: string | number;
};

type SingleSelect = {
  mode: 'single';
  selected: string | number | null;
  onConfirm: (value: string | number) => void;
};

type MultiSelect = {
  mode: 'multi';
  selected: (string | number)[];
  onConfirm: (values: (string | number)[]) => void;
};

export type SelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: SelectionItem[];
  confirmLabel?: string;
} & (SingleSelect | MultiSelect);
