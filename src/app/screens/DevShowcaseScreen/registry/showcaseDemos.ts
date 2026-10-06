import type React from 'react';
import { BottomSheetDemo } from '../demos/BottomSheetDemo';
import { BrandLogoDemo } from '../demos/BrandLogoDemo';
import { ButtonsDemo } from '../demos/ButtonsDemo';
import { ChipsDemo } from '../demos/ChipsDemo';
import { ColorsDemo } from '../demos/ColorsDemo';
import { ConfirmSheetDemo } from '../demos/ConfirmSheetDemo';
import { DateRangePickerDemo } from '../demos/DateRangePickerDemo';
import { FilePickerDemo } from '../demos/FilePickerDemo';
import { FormSectionDemo } from '../demos/FormSectionDemo';
import { GalleryDemo } from '../demos/GalleryDemo';
import { GlassDemo } from '../demos/GlassDemo';
import { GlobalErrorsDemo } from '../demos/GlobalErrorsDemo';
import { ImagesDemo } from '../demos/ImagesDemo';
import { InlineErrorDemo } from '../demos/InlineErrorDemo';
import { LayoutGalleryDemo } from '../demos/LayoutGalleryDemo';
import { ScreenHeaderDemo } from '../demos/ScreenHeaderDemo';
import { OtpDemo } from '../demos/OtpDemo';
import { SkeletonDemo } from '../demos/SkeletonDemo';
import { SocialIconsDemo } from '../demos/SocialIconsDemo';
import { StepProgressDemo } from '../demos/StepProgressDemo';
import { SuperListDemo } from '../demos/SuperListDemo';
import { SurfacesDemo } from '../demos/SurfacesDemo';
import { TextInputsDemo } from '../demos/TextInputsDemo';
import { ToastsDemo } from '../demos/ToastsDemo';
import { TypographyDemo } from '../demos/TypographyDemo';
import { IconButtonDemo } from '../demos/IconButtonDemo';
import { FABDemo } from '../demos/FABDemo';
import { SegmentedControlDemo } from '../demos/SegmentedControlDemo';
import { TabsDemo } from '../demos/TabsDemo';
import { SelectionControlsDemo } from '../demos/SelectionControlsDemo';
import { SearchBarDemo } from '../demos/SearchBarDemo';
import { BadgesDemo } from '../demos/BadgesDemo';
import { TierBadgeDemo } from '../demos/TierBadgeDemo';
import { StructureDemo } from '../demos/StructureDemo';
import { ProgressBarDemo } from '../demos/ProgressBarDemo';
import { GradientSurfaceDemo } from '../demos/GradientSurfaceDemo';
import { AccordionDemo } from '../demos/AccordionDemo';
import { AvatarGroupDemo } from '../demos/AvatarGroupDemo';
import { NoticeDemo } from '../demos/NoticeDemo';
import { EmptyStatesDemo } from '../demos/EmptyStatesDemo';
import { ListRowsDemo } from '../demos/ListRowsDemo';
import { MoneyTextDemo } from '../demos/MoneyTextDemo';
import { AmountInputDemo } from '../demos/AmountInputDemo';
import { TimelineDemo } from '../demos/TimelineDemo';
import { CountdownDemo } from '../demos/CountdownDemo';
import { MediaTileDemo } from '../demos/MediaTileDemo';
import { RatingStarsDemo } from '../demos/RatingStarsDemo';
import { StatTileDemo } from '../demos/StatTileDemo';
import { SparklineDemo } from '../demos/SparklineDemo';
import { DealStatusDemo } from '../demos/DealStatusDemo';
import { DealCardDemo } from '../demos/DealCardDemo';
import { CreatorCardDemo } from '../demos/CreatorCardDemo';
import { PlatformEditingDemo } from '../demos/PlatformEditingDemo';
import { DraftReviewDemo } from '../demos/DraftReviewDemo';
import { WalletDemo } from '../demos/WalletDemo';
import { MediaKitCardDemo } from '../demos/MediaKitCardDemo';
import type { ShowcaseEntryId } from './showcaseRegistry';

/** Kept apart from the registry so its jest test never loads native modules. */
export const SHOWCASE_DEMOS: Record<ShowcaseEntryId, React.ComponentType> = {
  typography: TypographyDemo,
  colors: ColorsDemo,
  surfaces: SurfacesDemo,
  brandLogo: BrandLogoDemo,
  socialIcons: SocialIconsDemo,
  buttons: ButtonsDemo,
  chips: ChipsDemo,
  textInputs: TextInputsDemo,
  otpInput: OtpDemo,
  formSection: FormSectionDemo,
  filePicker: FilePickerDemo,
  images: ImagesDemo,
  stepProgress: StepProgressDemo,
  glass: GlassDemo,
  toasts: ToastsDemo,
  inlineError: InlineErrorDemo,
  skeleton: SkeletonDemo,
  globalErrors: GlobalErrorsDemo,
  bottomSheet: BottomSheetDemo,
  confirmSheet: ConfirmSheetDemo,
  dateRangePicker: DateRangePickerDemo,
  gallery: GalleryDemo,
  superList: SuperListDemo,
  screenHeader: ScreenHeaderDemo,
  layoutGallery: LayoutGalleryDemo,
  iconButton: IconButtonDemo,
  fab: FABDemo,
  segmentedControl: SegmentedControlDemo,
  tabs: TabsDemo,
  selectionControls: SelectionControlsDemo,
  searchBar: SearchBarDemo,
  badges: BadgesDemo,
  tierBadge: TierBadgeDemo,
  structure: StructureDemo,
  progressBar: ProgressBarDemo,
  gradientSurface: GradientSurfaceDemo,
  accordion: AccordionDemo,
  avatarGroup: AvatarGroupDemo,
  notice: NoticeDemo,
  emptyStates: EmptyStatesDemo,
  listRows: ListRowsDemo,
  moneyText: MoneyTextDemo,
  amountInput: AmountInputDemo,
  timeline: TimelineDemo,
  countdown: CountdownDemo,
  mediaTile: MediaTileDemo,
  ratingStars: RatingStarsDemo,
  statTile: StatTileDemo,
  sparkline: SparklineDemo,
  dealStatus: DealStatusDemo,
  dealCard: DealCardDemo,
  creatorCard: CreatorCardDemo,
  platformEditing: PlatformEditingDemo,
  draftReview: DraftReviewDemo,
  wallet: WalletDemo,
  mediaKitCard: MediaKitCardDemo,
};
