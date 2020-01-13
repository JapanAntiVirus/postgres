<?php
if (isset($_POST['functionname'])) {
    $paPDO = initDB();
    $paSRID = '4326';
    $paPoint = $_POST['paPoint'];
    $functionname = $_POST['functionname'];

    $aResult = "null";
    switch ($functionname) {
        case 'getGeoCMRToAjax':
            $aResult = getGeoCMRToAjax($paPDO, $paSRID, $paPoint);
            break;
        case 'getInfoCMRToAjax':
            $aResult = getInfoCMRToAjax($paPDO, $paSRID, $paPoint);
            break;
    }
    echo $aResult;
    closeDB($paPDO);
}

function initDB()
{
    // Kết nối CSDL
    $paPDO = new PDO('pgsql:host=localhost;dbname=btl;port=5432', 'postgres', '123456');
    return $paPDO;
}

function query($paPDO, $paSQLStr)
{
    try {
        // Khai báo exception
        $paPDO->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Sử đụng Prepare 
        $stmt = $paPDO->prepare($paSQLStr);
        // Thực thi câu truy vấn
        $stmt->execute();

        // Khai báo fetch kiểu mảng kết hợp
        $stmt->setFetchMode(PDO::FETCH_ASSOC);

        // Lấy danh sách kết quả
        $paResult = $stmt->fetchAll();
        return $paResult;
    } catch (PDOException $e) {
        echo "Thất bại, Lỗi: " . $e->getMessage();
        return null;
    }
}
function closeDB($paPDO)
{
    // Ngắt kết nối
    $paPDO = null;
}

function getGeoCMRToAjax($paPDO, $paSRID, $paPoint)
{
    //echo $paPoint;
    //echo "<br>";
    $paPoint = str_replace(',', ' ', $paPoint);
    //echo $paPoint;
    //echo "<br>";
    //$mySQLStr = "SELECT ST_AsGeoJson(geom) as geo from \"CMR_adm1\" where ST_Within('SRID=4326;POINT(12 5)'::geometry,geom)";
    $mySQLStr = "SELECT ST_AsGeoJson(geom) as geo from \"gadm36_vnm_2\" where ST_Within('SRID=" . $paSRID . ";" . $paPoint . "'::geometry,geom)";
    //echo $mySQLStr;
    //echo "<br><br>";
    $result = query($paPDO, $mySQLStr);

    if ($result != null) {
        // Lặp kết quả
        foreach ($result as $item) {
            return $item['geo'];
        }
    } else
        return "null";
}

function getInfoCMRToAjax($paPDO, $paSRID, $paPoint)
{
    //echo $paPoint;
    //echo "<br>";
    $paPoint = str_replace(',', ' ', $paPoint);
    //echo $paPoint;
    //echo "<br>";
    //$mySQLStr = "SELECT ST_AsGeoJson(geom) as geo from \"CMR_adm1\" where ST_Within('SRID=4326;POINT(12 5)'::geometry,geom)";
    //$mySQLStr = "SELECT ST_AsGeoJson(geom) as geo from \"CMR_adm1\" where ST_Within('SRID=".$paSRID.";".$paPoint."'::geometry,geom)";
    $mySQLStr = "SELECT name_2 from \"gadm36_vnm_2\" where ST_Within('SRID=" . $paSRID . ";" . $paPoint . "'::geometry,geom)";
    //echo $mySQLStr;
    //echo "<br><br>";
    $result = query($paPDO, $mySQLStr);

    if ($result != null) {
        foreach ($result as $item) {
            return $item['name_2'];
        }
    } else
        return "null";
}
