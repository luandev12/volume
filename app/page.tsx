'use client';
import { Card, Col, Row, Typography } from 'antd';
import { BarChart } from '../components/barChart';
import { CardAsset } from '../components/cards/cardAsset';
import { CardCompany } from '../components/cards/cardCompany';
import { CardUnit } from '../components/cards/cardUnit';
import { CardUser } from '../components/cards/cardUser';
import { PieChart } from '../components/pieChart';
import NavLink from './nav-link';

const { Title, Link } = Typography;

export default function Home() {
  return (
    <>
      <h3>Dashboard</h3>
      <div className="container">hello</div>
    </>
  );
}
