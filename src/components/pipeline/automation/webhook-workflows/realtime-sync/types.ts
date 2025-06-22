
export interface DataSyncRule {
  id: string;
  name: string;
  sourceSystem: string;
  targetSystem: string;
  dataType: string;
  syncDirection: 'bidirectional' | 'push' | 'pull';
  isActive: boolean;
  frequency: string;
  lastSync?: string;
  syncCount: number;
  status: 'healthy' | 'error' | 'syncing';
}

export interface NewDataSyncRule {
  name: string;
  sourceSystem: string;
  targetSystem: string;
  dataType: string;
  syncDirection: 'bidirectional' | 'push' | 'pull';
  frequency: string;
}
