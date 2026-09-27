import type { ParseKeys } from 'i18next';
import type { DevShowcaseCategoryId } from '@/core/navigation';
import type * as UiKit from '@/shared/ui';
import type * as FinanceDomain from '@/domains/finance';
import type * as MarketplaceDomain from '@/domains/marketplace';

/** Every runtime export of `@/shared/ui`. */
export type UiExportName = keyof typeof UiKit;

/** Runtime exports of the domains whose public components get a demo in the `sada` category. */
export type DomainExportName = keyof typeof MarketplaceDomain | keyof typeof FinanceDomain;

interface ShowcaseCategoryDef {
  titleKey: ParseKeys;
  descriptionKey: ParseKeys;
}

interface ShowcaseEntryDef {
  category: DevShowcaseCategoryId;
  titleKey: ParseKeys;
  /** Kit exports this demo exercises. The registry test fails on any export no entry covers. */
  covers: readonly UiExportName[];
  /** Domain components this demo exercises. The registry test fails on any public domain component no entry covers. */
  domainCovers?: readonly DomainExportName[];
}

export const SHOWCASE_CATEGORIES = {
  foundations: {
    titleKey: 'devShowcase.categories.foundations',
    descriptionKey: 'devShowcase.categories.foundationsDescription',
  },
  actions: {
    titleKey: 'devShowcase.categories.actions',
    descriptionKey: 'devShowcase.categories.actionsDescription',
  },
  inputs: {
    titleKey: 'devShowcase.categories.inputs',
    descriptionKey: 'devShowcase.categories.inputsDescription',
  },
  display: {
    titleKey: 'devShowcase.categories.display',
    descriptionKey: 'devShowcase.categories.displayDescription',
  },
  feedback: {
    titleKey: 'devShowcase.categories.feedback',
    descriptionKey: 'devShowcase.categories.feedbackDescription',
  },
  overlays: {
    titleKey: 'devShowcase.categories.overlays',
    descriptionKey: 'devShowcase.categories.overlaysDescription',
  },
  lists: {
    titleKey: 'devShowcase.categories.lists',
    descriptionKey: 'devShowcase.categories.listsDescription',
  },
  layouts: {
    titleKey: 'devShowcase.categories.layouts',
    descriptionKey: 'devShowcase.categories.layoutsDescription',
  },
  sada: {
    titleKey: 'devShowcase.categories.sada',
    descriptionKey: 'devShowcase.categories.sadaDescription',
  },
} as const satisfies Record<DevShowcaseCategoryId, ShowcaseCategoryDef>;

export const SHOWCASE_CATEGORY_ORDER: readonly DevShowcaseCategoryId[] = [
  'foundations',
  'actions',
  'inputs',
  'display',
  'feedback',
  'overlays',
  'lists',
  'layouts',
  'sada',
];

/** Order inside a category = order here. */
export const SHOWCASE_ENTRIES = {
  typography: {
    category: 'foundations',
    titleKey: 'devShowcase.sections.typography',
    covers: ['Text'],
  },
  colors: {
    category: 'foundations',
    titleKey: 'devShowcase.sections.colors',
    covers: [],
  },
  surfaces: {
    category: 'foundations',
    titleKey: 'devShowcase.sections.cards',
    covers: ['Box', 'Card', 'Pressable'],
  },
  brandLogo: {
    category: 'foundations',
    titleKey: 'devShowcase.sections.brandLogo',
    covers: ['BrandLogo'],
  },
  socialIcons: {
    category: 'foundations',
    titleKey: 'devShowcase.sections.socialIcons',
    covers: ['SocialPlatformIcon'],
  },
  buttons: {
    category: 'actions',
    titleKey: 'devShowcase.sections.buttons',
    covers: ['CustomButton'],
  },
  chips: {
    category: 'actions',
    titleKey: 'devShowcase.sections.chips',
    covers: ['Chip', 'ChipGroup'],
  },
  iconButton: {
    category: 'actions',
    titleKey: 'devShowcase.sections.iconButton',
    covers: ['IconButton'],
  },
  fab: {
    category: 'actions',
    titleKey: 'devShowcase.sections.fab',
    covers: ['FAB'],
  },
  segmentedControl: {
    category: 'actions',
    titleKey: 'devShowcase.sections.segmentedControl',
    covers: ['SegmentedControl'],
  },
  tabs: {
    category: 'actions',
    titleKey: 'devShowcase.sections.tabs',
    covers: ['Tabs'],
  },
  textInputs: {
    category: 'inputs',
    titleKey: 'devShowcase.sections.inputs',
    covers: ['CustomInput', 'PhoneInput'],
  },
  otpInput: {
    category: 'inputs',
    titleKey: 'devShowcase.sections.otpInput',
    covers: ['OtpInput'],
  },
  formSection: {
    category: 'inputs',
    titleKey: 'devShowcase.sections.formSection',
    covers: ['FormSection'],
  },
  filePicker: {
    category: 'inputs',
    titleKey: 'devShowcase.sections.filePicker',
    covers: ['FilePickerCard'],
  },
  selectionControls: {
    category: 'inputs',
    titleKey: 'devShowcase.sections.selectionControls',
    covers: ['Switch', 'Checkbox', 'Radio', 'RadioGroup'],
  },
  searchBar: {
    category: 'inputs',
    titleKey: 'devShowcase.sections.searchBar',
    covers: ['SearchBar'],
  },
  amountInput: {
    category: 'inputs',
    titleKey: 'devShowcase.sections.amountInput',
    covers: ['AmountInput'],
  },
  images: {
    category: 'display',
    titleKey: 'devShowcase.sections.images',
    covers: ['Image', 'Avatar', 'Thumbnail', 'Banner'],
  },
  stepProgress: {
    category: 'display',
    titleKey: 'devShowcase.sections.stepProgress',
    covers: ['StepProgress'],
  },
  glass: {
    category: 'display',
    titleKey: 'devShowcase.sections.glass',
    covers: ['HeroBackdrop', 'GlassCard', 'useGlassCardStyle'],
  },
  badges: {
    category: 'display',
    titleKey: 'devShowcase.sections.badges',
    covers: ['Badge', 'StatusPill', 'Tag'],
  },
  structure: {
    category: 'display',
    titleKey: 'devShowcase.sections.structure',
    covers: ['Divider', 'SectionHeader', 'KeyValueRow'],
  },
  progressBar: {
    category: 'display',
    titleKey: 'devShowcase.sections.progressBar',
    covers: ['ProgressBar'],
  },
  accordion: {
    category: 'display',
    titleKey: 'devShowcase.sections.accordion',
    covers: ['Accordion'],
  },
  avatarGroup: {
    category: 'display',
    titleKey: 'devShowcase.sections.avatarGroup',
    covers: ['AvatarGroup'],
  },
  moneyText: {
    category: 'display',
    titleKey: 'devShowcase.sections.moneyText',
    covers: ['MoneyText'],
  },
  statTile: {
    category: 'display',
    titleKey: 'devShowcase.sections.statTile',
    covers: ['StatTile'],
  },
  timeline: {
    category: 'display',
    titleKey: 'devShowcase.sections.timeline',
    covers: ['Timeline'],
  },
  countdown: {
    category: 'display',
    titleKey: 'devShowcase.sections.countdown',
    covers: ['Countdown'],
  },
  mediaTile: {
    category: 'display',
    titleKey: 'devShowcase.sections.mediaTile',
    covers: ['MediaTile'],
  },
  ratingStars: {
    category: 'display',
    titleKey: 'devShowcase.sections.ratingStars',
    covers: ['RatingStars'],
  },
  toasts: {
    category: 'feedback',
    titleKey: 'devShowcase.sections.toasts',
    covers: ['ToastCard'],
  },
  inlineError: {
    category: 'feedback',
    titleKey: 'devShowcase.sections.inlineError',
    covers: ['InlineError'],
  },
  skeleton: {
    category: 'feedback',
    titleKey: 'devShowcase.sections.skeleton',
    covers: ['Skeleton'],
  },
  globalErrors: {
    category: 'feedback',
    titleKey: 'devShowcase.sections.globalErrors',
    covers: ['GlobalErrorModal', 'NetworkSnackbar'],
  },
  notice: {
    category: 'feedback',
    titleKey: 'devShowcase.sections.notice',
    covers: ['Notice'],
  },
  emptyStates: {
    category: 'feedback',
    titleKey: 'devShowcase.sections.emptyStates',
    covers: ['EmptyState', 'ErrorState'],
  },
  bottomSheet: {
    category: 'overlays',
    titleKey: 'devShowcase.sections.bottomSheet',
    covers: ['BottomSheet', 'SelectionModal'],
  },
  confirmSheet: {
    category: 'overlays',
    titleKey: 'devShowcase.sections.confirmSheet',
    covers: ['ConfirmSheet'],
  },
  dateRangePicker: {
    category: 'overlays',
    titleKey: 'devShowcase.sections.dateRangePicker',
    covers: ['DateRangePicker'],
  },
  gallery: {
    category: 'overlays',
    titleKey: 'devShowcase.sections.gallery',
    covers: ['GalleryModal'],
  },
  superList: {
    category: 'lists',
    titleKey: 'devShowcase.sections.superList',
    covers: ['SuperList', 'LayoutToggle', 'useListLayout'],
  },
  listRows: {
    category: 'lists',
    titleKey: 'devShowcase.sections.listRows',
    covers: ['ListRow', 'ListGroup'],
  },
  screenHeader: {
    category: 'layouts',
    titleKey: 'devShowcase.sections.screenHeader',
    covers: ['ScreenHeader'],
  },
  layoutGallery: {
    category: 'layouts',
    titleKey: 'devShowcase.sections.layoutGallery',
    covers: [
      'Layout',
      'LayoutFooter',
      'HeroSheet',
      'useHeroCompact',
      'WizardShell',
      'useWizardHeader',
    ],
  },
  dealStatus: {
    category: 'sada',
    titleKey: 'devShowcase.sections.dealStatus',
    covers: [],
    domainCovers: ['DealStatusPill', 'DealProgress'],
  },
  dealCard: {
    category: 'sada',
    titleKey: 'devShowcase.sections.dealCard',
    covers: [],
    domainCovers: ['DealCard'],
  },
  creatorCard: {
    category: 'sada',
    titleKey: 'devShowcase.sections.creatorCard',
    covers: [],
    domainCovers: ['CreatorCard'],
  },
  draftReview: {
    category: 'sada',
    titleKey: 'devShowcase.sections.draftReview',
    covers: [],
    domainCovers: ['DraftReviewCard'],
  },
  wallet: {
    category: 'sada',
    titleKey: 'devShowcase.sections.wallet',
    covers: [],
    domainCovers: ['BalanceCard', 'PaymentBreakdown'],
  },
} as const satisfies Record<string, ShowcaseEntryDef>;

export type ShowcaseEntryId = keyof typeof SHOWCASE_ENTRIES;

/**
 * Exports that are not visual components on their own. Each needs a reason;
 * a component never belongs here (give it a demo instead).
 */
export const SHOWCASE_EXEMPT = {
  toastConfig: 'Toast root config; ToastCard is the visual',
  DateRangePickerContent:
    'body of DateRangePicker for use inside an existing modal',
  SKIA_ICON_PATHS: 'path data for Skia canvases',
  ICON_VIEWBOX: 'path data for Skia canvases',
  FloatingBottomBar: 'tab bar, always visible on the Main tabs',
  ErrorBoundary: 'rendered by SuperList',
  SkeletonItem: 'rendered by SuperList while loading',
  SkeletonList: 'rendered by SuperList while loading',
  useScrollRestoration: 'hook behind SuperList scrollRestorationKey',
  useOptimisticReaction: 'data hook, no UI',
  useInfiniteScroll: 'data hook behind SuperList pagination',
} as const satisfies Partial<Record<UiExportName, string>>;
