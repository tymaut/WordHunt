<?php

$level = (isset($_GET['level'])?$_GET['level']:-1);
if($level == -1)
	$level = rand(0,2);

$levelArray[] = array(4=>3,5=>5,6=>5,7=>2,8=>2);
$levelArray[] = array(4=>4,5=>2,6=>2,7=>2,8=>5);
$levelArray[] = array(4=>4,5=>5,6=>3,7=>3,8=>1);

$result = getWords($levelArray[$level]);
echo json_encode($result);

function getWords($level)
{
	$wordArray = [];
	$con=mysqli_connect("localhost","wordFindUser","password","WordFindDB");
	// Check connection
	if (mysqli_connect_errno()) {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}
	while (list($key, $val) = each($level)) {
		$result = mysqli_query($con,"SELECT * FROM Words WHERE Length=$key ORDER BY RAND() LIMIT $val");
		while($row = mysqli_fetch_array($result)) {
			$wordArray[] = ($row['Word']);
		}
	}
	mysqli_close($con);
	return $wordArray;
}
?>
