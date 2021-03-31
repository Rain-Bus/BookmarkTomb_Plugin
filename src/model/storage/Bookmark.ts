export class Bookmark{
  id: number;
  localId: number;
  parentId: number;
  title: string;
  url: string;
  defaultThumbnail: string;
  customThumbnail: string;
  tags: string[];
  topTime: Date;
  lastEditTime: Date;
  deleteTime: Date;
  removeTime: Date;
  createdTime: Date;
}