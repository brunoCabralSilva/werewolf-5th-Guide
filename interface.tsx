export interface ITypeGift {
  type: string;
  totalRenown: number;
}

export interface IGift {
  gift: string;
  giftPtBr: string;
  belonging: ITypeGift[];
  description: string;
  descriptionPtBr: string;
  renown: string;
  cost: string;
  action: string;
  pool: string;
  system: string;
  systemPtBr: string;
  duration: string;
  book: string;
  page: number;
}

export interface IRitual {
  titlePtBr: String;
  title:String;
  type: String;
  descriptionPtBr: String;
  description: String;
  pool: String;
  systemPtBr: String;
  system: String;
  book: String;
  page: number;
}

export interface ITalisman {
  title :String;
  titlePtBr :String;
  description :String;
  descriptionPtBr :String;
  system :String;
  systemPtBr :String;
  backgroundCost :String;
  backgroundCostPtBr :String;
  book: String;
  page: number;
}

export interface IAuspice {
  name: String;
  phrase: String;
  description: String[];
}

export interface IForm {
  name: String;
  subtitle: String;
  description: String;
  cost: String;
  skills: String;
  list: String[];
}

export interface IProps {
  valorRenown: number;
  selectedTrybe: string[];
}

export interface IFeedback {
  show: boolean,
  title: String,
}

export interface IMessage {
  type: String;
  show: boolean;
  text: String;
}

export interface IType {
  text: String;
  type: String;
}

export interface IList {
  type: String;
  items: IGift[] | ITalisman[] | IRitual[];
}

export interface IArchetypes {
  title: String;
  description: String;
}

export interface ITrybe {
  namePtBr: String;
  nameEn: String;
  phrase: String;
  description: String[];
  whoAre: String[];
  patron: String;
  favor: String;
  ban: String;
  archetypes: IArchetypes[];
};