import { app } from 'electron';
import * as path from 'path';
import { promises as fs } from 'fs';
import { UserData } from '/src/types/UserData'
import { DEFAULT_USERDATA } from '../states/states';

const dataFilePath = path.join(app.getPath('userData'), 'userData.json');

export const readData = async () => {
  try {
    const rawData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(rawData) as UserData;
  } catch (error) {
    return DEFAULT_USERDATA;
  }
}

export const writeData = async (data: any) => await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));