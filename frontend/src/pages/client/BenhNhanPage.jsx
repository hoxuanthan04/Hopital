import { useEffect, useState } from "react";
import { getBenhNhan } from "../../services/benhnhanApi";

function BenhNhanPage() {
  const [benhnhan, setBenhNhan] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getBenhNhan();
    setBenhNhan(data);
  };

  return (
    <div>
      <h2>Danh sách bệnh nhân</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Họ tên</th>
            <th>Giới tính</th>
            <th>Năm sinh</th>
            <th>Điện thoại</th>
          </tr>
        </thead>

        <tbody>
          {benhnhan.map((bn) => (
            <tr key={bn.mabenhnhan}>
              <td>{bn.mabenhnhan}</td>
              <td>{bn.hoten}</td>
              <td>{bn.gioitinh}</td>
              <td>{bn.namsinh}</td>
              <td>{bn.dienthoai}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BenhNhanPage;