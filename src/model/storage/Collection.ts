export class Collection {
  id: number;
  parentId: number;
  title: string;
  createdTime: Date;
  deleteTime: Date;
  removeTime: Date;
  lastEditTime: Date;
  description: string;
  tags: string[];
  item: number;
  serverParentId: number;
  localId: number;
}