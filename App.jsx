/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DIARY_DATA_KEY = 'loloCatDiaryData';
const AVATAR_KEY = 'loloCatAvatar';

const defaultAvatar = `data:image/svg+xml;utf8,<svg width="128" height="128" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 9.5C16 10.3284 15.3284 11 14.5 11C13.6716 11 13 10.3284 13 9.5C13 8.67157 13.6716 8 14.5 8C15.3284 8 16 8.67157 16 9.5Z" fill="%23cccccc"/><path d="M11 9.5C11 10.3284 10.3284 11 9.5 11C8.67157 11 8 10.3284 8 9.5C8 8.67157 8.67157 8 9.5 8C10.3284 8 11 8.67157 11 9.5Z" fill="%23cccccc"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" fill="%23cccccc"/><path d="M16 15C14.6667 16.3333 13.3333 17 12 17C10.6667 17 9.33333 16.3333 8 15" stroke="%23cccccc" stroke-width="1.5" stroke-linecap="round"/><path d="M5 9L3 8" stroke="%23cccccc" stroke-width="1.5" stroke-linecap="round"/><path d="M6 12L3 12" stroke="%23cccccc" stroke-width="1.5" stroke-linecap="round"/><path d="M5 15L3 16" stroke="%23cccccc" stroke-width="1.5" stroke-linecap="round"/><path d="M19 9L21 8" stroke="%23cccccc" stroke-width="1.5" stroke-linecap="round"/><path d="M18 12L21 12" stroke="%23cccccc" stroke-width="1.5" stroke-linecap="round"/><path d="M19 15L21 16" stroke="%23cccccc" stroke-width="1.5" stroke-linecap="round"/></svg>`.replace(/\n/g, '').replace(/#/g, '%23');

const getToday = () => new Date().toISOString().split('T')[0];

export default function App() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(DIARY_DATA_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse records from localStorage", error);
      return [];
    }
  });

  const [avatar, setAvatar] = useState(() => localStorage.getItem(AVATAR_KEY) || defaultAvatar);
  
  const [formData, setFormData] = useState({
    date: getToday(),
    food: '',
    treats: '',
    dried: '',
    weight: '',
  });

  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(DIARY_DATA_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(AVATAR_KEY, avatar);
  }, [avatar]);
  
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (records.some(r => r.date === formData.date)) {
        alert("这一天已经有记录了！");
        return;
    }
    const newRecord = { id: Date.now(), ...formData };
    setRecords(prev => [...prev, newRecord]);
    setFormData({
      date: getToday(),
      food: '',
      treats: '',
      dried: '',
      weight: '',
    });
  }, [formData, records]);

  const handleDelete = useCallback((id) => {
    if (window.confirm("确定要删除这条记录吗？")) {
        setRecords(prev => prev.filter(record => record.id !== id));
    }
  }, []);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records]);

  const chartData = useMemo(() => {
    return [...records]
      .filter(r => r.weight || r.food)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(r => ({
        ...r,
        date: new Date(r.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        weight: parseFloat(r.weight) || null,
        food: parseFloat(r.food) || null,
      }));
  }, [records]);


  return (
    <div className="app-container">
      <header className="header">
        <div className="avatar-container" onClick={handleAvatarClick} title="点击更换头像">
          <img src={avatar} alt="Lolo's Avatar" className="avatar" />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
        <h1>Lolo's 日记</h1>
      </header>
      
      <main>
        <section className="form-section">
          <h2>记录今天</h2>
          <form onSubmit={handleSubmit} className="data-form">
            <div className="form-group">
              <label htmlFor="date">日期</label>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="food">猫粮 (克)</label>
              <input type="number" id="food" name="food" placeholder="例如: 50" value={formData.food} onChange={handleInputChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="treats">猫条 (根)</label>
              <input type="number" id="treats" name="treats" placeholder="例如: 1" value={formData.treats} onChange={handleInputChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="dried">冻干 (颗)</label>
              <input type="number" id="dried" name="dried" placeholder="例如: 5" value={formData.dried} onChange={handleInputChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="weight">体重 (kg)</label>
              <input type="number" id="weight" name="weight" placeholder="例如: 4.5" value={formData.weight} onChange={handleInputChange} min="0" step="0.01" />
            </div>
            <button type="submit" className="submit-btn">记录今天</button>
          </form>
        </section>

        {records.length >= 2 && (
          <section className="charts-section">
            <h2>数据图表</h2>
            <div className="charts-container">
              <div className="chart-wrapper">
                <h3>体重变化 (kg)</h3>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} allowDecimals={true} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" name="体重" stroke="#8884d8" strokeWidth={2} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-wrapper">
                <h3>猫粮摄入 (克)</h3>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="food" name="猫粮" stroke="#82ca9d" strokeWidth={2} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        <section className="history-section">
          <h2 onClick={() => setIsHistoryVisible(!isHistoryVisible)} className={`history-toggle ${!isHistoryVisible ? 'collapsed' : ''}`}>
            历史记录
            <span className="toggle-icon">▾</span>
          </h2>
          {isHistoryVisible && (
            sortedRecords.length > 0 ? (
              <ul className="history-list">
                {sortedRecords.map(record => (
                  <li key={record.id} className="history-card">
                    <div className="card-content">
                      <p><strong>日期:</strong> {record.date}</p>
                      <p><strong>猫粮:</strong> {record.food || 'N/A'} 克</p>
                      <p><strong>猫条:</strong> {record.treats || 'N/A'} 根</p>
                      <p><strong>冻干:</strong> {record.dried || 'N/A'} 颗</p>
                      <p><strong>体重:</strong> {record.weight || 'N/A'} kg</p>
                    </div>
                    <button onClick={() => handleDelete(record.id)} className="delete-btn">删除</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">还没有任何记录。</p>
            )
          )}
        </section>
      </main>
    </div>
  );
}
