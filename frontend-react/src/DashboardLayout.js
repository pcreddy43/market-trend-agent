import React from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  PieChartOutlined,
  FileTextOutlined,
  BarChartOutlined,
  MessageOutlined,
  ApartmentOutlined,
  RocketOutlined,
  GlobalOutlined,
  ClusterOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: 'overview', icon: <PieChartOutlined />, label: 'Insights Overview', style: { background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)', color: '#222', fontWeight: 600 } },
  { key: 'insights', icon: <BarChartOutlined />, label: 'Top Picks', style: { background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)', color: '#fff', fontWeight: 600 } },
  { key: 'market', icon: <PieChartOutlined />, label: 'Market Data', style: { background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff', fontWeight: 600 } },
  { key: 'news', icon: <FileTextOutlined />, label: 'News', style: { background: 'linear-gradient(90deg, #f953c6 0%, #b91d73 100%)', color: '#fff', fontWeight: 600 } },
  { key: 'sec', icon: <BarChartOutlined />, label: 'SEC Filings', style: { background: 'linear-gradient(90deg, #ee9ca7 0%, #ffdde1 100%)', color: '#222', fontWeight: 600 } },
  { key: 'sentiment', icon: <MessageOutlined />, label: 'Social Sentiment', style: { background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)', color: '#222', fontWeight: 600 } },
  { key: 'combinedsentiment', icon: <BarChartOutlined />, label: 'Combined Sentiment', style: { background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)', color: '#fff', fontWeight: 600 } },
  { key: 'macro', icon: <GlobalOutlined />, label: 'Macro', style: { background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff', fontWeight: 600 } },
  { key: 'events', icon: <ApartmentOutlined />, label: 'Company Events', style: { background: 'linear-gradient(90deg, #f953c6 0%, #b91d73 100%)', color: '#fff', fontWeight: 600 } },
  { key: 'startup', icon: <RocketOutlined />, label: 'Startup Signals', style: { background: 'linear-gradient(90deg, #ee9ca7 0%, #ffdde1 100%)', color: '#222', fontWeight: 600 } },
  { key: 'nlp', icon: <ClusterOutlined />, label: 'NLP Extraction', style: { background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)', color: '#222', fontWeight: 600 } },
];

export default function DashboardLayout({ selectedKey, onMenuChange, children }) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="60" style={{ background: '#fff' }}>
        <div style={{ height: 48, margin: 16, fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>
          <span role="img" aria-label="logo">📈</span> TrendAgent
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => onMenuChange(key)}
          items={menuItems.map(item => ({ ...item, label: <span style={item.style}>{item.label}</span> }))}
          style={{ height: '100%', borderRight: 0, fontWeight: 600 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, fontSize: 22, fontWeight: 600, textAlign: 'center' }}>
          Market Trend Multi-Agent Dashboard
        </Header>
        <Content style={{ margin: '24px 16px 0', background: colorBgContainer, minHeight: 360 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
