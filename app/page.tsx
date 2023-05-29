'use client';
import { Button, DatePicker, Input, Table, message } from 'antd';
import axios from 'axios';
import * as FileSaver from 'file-saver';
import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'timeOpen',
      key: 'timeOpen',
      render: (timeOpen: any) => <a>{moment(timeOpen).format('DD/MM/YYYY')}</a>,
    },
    {
      title: 'Volume',
      dataIndex: 'quote',
      key: 'quote',
      render: (quote: any) => (
        <a>
          {quote.volume.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </a>
      ),
    },
  ];

  const handleChange = async (v: any) => {
    const start = moment(v[0].$d);
    const end = moment(v[1].$d);

    setLoading(true);

    const distanceMonth = end.diff(start, 'month') + 1;
    const distances = [];
    const dataAll: any = [];

    if (distanceMonth <= 3) {
      distances.push({
        end: end.unix(),
        start: start.unix(),
      });
    } else {
      for (let i = 0; i < distanceMonth; i += 3) {
        distances.push({
          end: moment(moment(end))
            .subtract((i / 3) * 90, 'days')
            .unix(),
          start:
            moment(end)
              .subtract((i / 3 + 1) * 90, 'days')
              .diff(moment(start), 'days') < 0
              ? moment(start).unix()
              : moment(end)
                  .subtract((i / 3 + 1) * 90, 'days')
                  .unix(),
        });
      }
    }

    const requests = distances.map((item) => {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api?start=${item.start}&end=${item.end}&name=${name}`, {})
          .then(({ data }) => resolve(data))
          .catch((error) => reject(error));
      });
    });

    try {
      const result = await Promise.all(requests);

      result.map((r: any) => r.data.quotes.map((q: any) => dataAll.push(q)));

      const dataAllSort = dataAll.sort(
        (a: any, b: any) => Date.parse(b.timeOpen) - Date.parse(a.timeOpen)
      );

      setQuotes(dataAllSort);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleChangeSlug = (v: any) => {
    setName(v.target.value.split('/')[4]);
  };

  useEffect(() => {}, [quotes]);

  const exportVolume = () => {
    setLoading(true);

    const result = quotes.map((d: any) => ({
      ['Date']: moment(d.timeOpen).format('DD-MM-YYYY'),
      ['volume']: d.quote.volume,
    }));

    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const ws = XLSX.utils.json_to_sheet(result);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `volume-triet` + fileExtension);

    setLoading(false);

    message.success('Exports success!');
  };

  const getTotal = () => {
    return (
      quotes.map((q: any) => q.quote.volume).reduce((a, b) => a + b) /
      quotes.length
    ).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <>
      <div className="container mb-4">
        <Input placeholder="Link Coinmaketcap" onChange={handleChangeSlug} />
        {name && (
          <div className="d-flex align-items-center">
            <h3 className="">{name}</h3>
            <RangePicker onChange={handleChange} className="my-4 mx-2" />
            <Button type="primary" onClick={exportVolume} className="mx-2">
              Export Volume
            </Button>
            <h3 className="">{getTotal()}</h3>
          </div>
        )}
        <Table
          columns={columns}
          dataSource={quotes}
          loading={loading}
          pagination={{ pageSize: 100 }}
        />
      </div>
    </>
  );
}
